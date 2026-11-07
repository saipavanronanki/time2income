'use strict';

(() => {
  const bucketName = 'identity-documents';
  const maxFileSize = 50 * 1024 * 1024;
  const acceptedTypes = new Set([
    'application/pdf',
    'image/heic',
    'image/heif',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]);
  const databaseName = 'time2income-private-identity';
  const objectStoreName = 'pending-documents';
  const submissionsByUser = new Map();
  let missingRequirementsWarningLogged = false;
  const mimeByExtension = new Map([
    ['pdf', 'application/pdf'],
    ['heic', 'image/heic'],
    ['heif', 'image/heif'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png'],
    ['webp', 'image/webp']
  ]);

  function getFileType(file) {
    if (acceptedTypes.has(file.type)) return file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    return mimeByExtension.get(extension) || '';
  }

  function validateFile(file) {
    if (!file) throw new Error('Choose an ID photo or PDF document.');
    if (file.size > maxFileSize) throw new Error('The ID document must be 50 MB or smaller.');
    if (!getFileType(file)) {
      throw new Error('Choose a JPEG, PNG, WebP, HEIC, HEIF, or PDF ID document.');
    }
    return getFileType(file);
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(objectStoreName)) {
          request.result.createObjectStore(objectStoreName, { keyPath: 'email' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open private document storage.'));
      request.onblocked = () => reject(new Error('Private document storage is busy in another browser tab. Close the other tab and try again.'));
    });
  }

  async function clearLegacyStagedDocuments() {
    if (!window.indexedDB) return;
    const database = await openDatabase();
    try {
      if (!database.objectStoreNames.contains(objectStoreName)) return;
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(objectStoreName, 'readwrite');
        transaction.objectStore(objectStoreName).clear();
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error('Could not clear previously staged ID documents from this browser.'));
        transaction.onabort = () => reject(transaction.error || new Error('Could not clear previously staged ID documents from this browser.'));
      });
    } finally {
      database.close();
    }
  }

  async function getRequirement(user) {
    const { data, error } = await window.supabaseClient
      .from('identity_document_requirements')
      .select('submitted_at')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      if (isMissingTableError(error, 'identity_document_requirements')) {
        warnIdentityRequirementsUnavailable(error);
        return { required:false, submitted:false };
      }
      throw error;
    }
    let requestResult = await window.supabaseClient
      .from('identity_document_requests')
      .select('id, status, submitted_at, requester_message')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending:false })
      .limit(1)
      .maybeSingle();
    const requestErrorText = `${requestResult.error?.message || ''} ${requestResult.error?.details || ''}`;
    if (requestResult.error
      && ['PGRST204', '42703'].includes(requestResult.error.code)
      && /requester_message/i.test(requestErrorText)) {
      requestResult = await window.supabaseClient
        .from('identity_document_requests')
        .select('id, status, submitted_at')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending:false })
        .limit(1)
        .maybeSingle();
    }
    const { data: request, error: requestError } = requestResult;
    if (requestError) {
      if (isMissingTableError(requestError, 'identity_document_requests')) {
        warnIdentityRequirementsUnavailable(requestError);
        return { required:false, submitted:false, status:'unavailable' };
      }
      throw requestError;
    }
    const status = request?.status === 'approved' ? 'verified' : request?.status || '';
    const submitted = ['pending', 'verified'].includes(status)
      || (!request && Boolean(data?.submitted_at));
    return {
      required: Boolean(data) || user.user_metadata?.identity_document_required === true,
      submitted,
      status: status || (submitted ? 'pending' : 'not_submitted'),
      requesterMessage: request?.requester_message || ''
    };
  }

  function isMissingTableError(error, tableName) {
    const message = String(error?.message || '').toLocaleLowerCase();
    return ['PGRST205', '42P01'].includes(error?.code)
      && message.includes(tableName);
  }

  function warnIdentityRequirementsUnavailable(error) {
    if (missingRequirementsWarningLogged) return;
    missingRequirementsWarningLogged = true;
    console.warn(
      'ID verification is not enabled because its Supabase migration is not installed. Sign-in will continue without ID verification until the migration is applied.',
      error
    );
  }

  async function submitDocument(user, file, suppliedType) {
    const existing = submissionsByUser.get(user.id);
    if (existing) return existing;

    const submission = (async () => {
      const requirement = await getRequirement(user);
      if (requirement.submitted) return;

      const contentType = suppliedType || validateFile(file);
      const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('Sign in before uploading an ID document.');
      if (!window.tus?.Upload) throw new Error('Resumable document upload is unavailable. Refresh the page and try again.');
      const client = window.supabaseClient;
      await new Promise((resolve, reject) => {
        const upload = new window.tus.Upload(file, {
          endpoint: `${client.supabaseUrl}/storage/v1/upload/resumable`,
          headers: {
            apikey: client.supabaseKey,
            authorization: `Bearer ${sessionData.session.access_token}`,
            'x-upsert': 'false'
          },
          metadata: {
            bucketName,
            objectName: objectPath,
            contentType,
            cacheControl: '0'
          },
          chunkSize: 6 * 1024 * 1024,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          onError: reject,
          onProgress: (uploadedBytes, totalBytes) => {
            const percent = Math.floor(uploadedBytes / totalBytes * 100);
            window.dispatchEvent(new CustomEvent('time2income:identity-upload-progress', {
              detail: { percent }
            }));
          },
          onSuccess: resolve
        });
        upload.start();
      });

      const { error: requestError } = await window.supabaseClient
        .from('identity_document_requests')
        .insert({ user_id: user.id, document_path: objectPath });
      if (requestError) {
        const { error: cleanupError } = await window.supabaseClient.storage
          .from(bucketName)
          .remove([objectPath]);
        if (cleanupError) {
          console.error('Could not clean up an ID document that was not linked to a review request:', cleanupError);
        }
        throw requestError;
      }
    })();

    submissionsByUser.set(user.id, submission);
    try {
      await submission;
    } finally {
      submissionsByUser.delete(user.id);
    }
  }

  async function submitSelected(user, file) {
    const contentType = validateFile(file);
    await submitDocument(user, file, contentType);
  }

  window.TIME2INCOME_IDENTITY_DOCUMENTS = Object.freeze({
    maxFileSize,
    validateFile,
    clearLegacyStagedDocuments,
    getRequirement,
    submitDocument,
    submitSelected
  });
})();
