'use strict';

function normalizeCatalogName(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, ' ')
    .trim();
}

window.TIME2INCOME_SKILL_CATEGORY_NAMES = Object.freeze(
  [...new Set(Object.values(window.TIME2INCOME_SKILL_CATEGORIES))].sort((a, b) => a.localeCompare(b))
);

async function loadApprovedSkillCatalog() {
  const { data, error } = await supabaseClient
    .from('skill_catalog')
    .select('kind, name, category')
    .eq('is_seeded', false)
    .order('name');
  if (error) throw error;

  const skills = new Set(window.TIME2INCOME_SKILLS);
  const aliases = { ...window.TIME2INCOME_SKILL_ALIASES };
  const categoriesBySkill = { ...window.TIME2INCOME_SKILL_CATEGORIES };
  const categories = new Set(window.TIME2INCOME_SKILL_CATEGORY_NAMES);

  data.forEach(entry => {
    if (entry.kind === 'category') {
      categories.add(entry.name);
      return;
    }
    if (entry.kind !== 'skill' || !entry.category) {
      throw new Error('The approved skill catalog contains an invalid entry.');
    }
    const existing = [...skills].find(skill => normalizeCatalogName(skill) === normalizeCatalogName(entry.name));
    const skill = existing || entry.name;
    skills.add(skill);
    categoriesBySkill[skill] = entry.category;
    if (!aliases[skill]) aliases[skill] = [];
  });

  window.TIME2INCOME_SKILLS = Object.freeze([...skills]);
  window.TIME2INCOME_SKILL_ALIASES = Object.freeze(aliases);
  window.TIME2INCOME_SKILL_CATEGORIES = Object.freeze(categoriesBySkill);
  window.TIME2INCOME_SKILL_CATEGORY_NAMES = Object.freeze([...categories].sort((a, b) => a.localeCompare(b)));
  return true;
}

window.TIME2INCOME_CATALOG_READY = loadApprovedSkillCatalog().catch(error => {
  console.error('Approved skill catalog could not be loaded. Check that supabase/skill-catalog-suggestions.sql has been reviewed and applied to the intended project.', error);
  return false;
});

let pendingSignupSuggestionRequest = null;

window.TIME2INCOME_CATALOG = Object.freeze({
  async submitSuggestion(kind, name, category = null) {
    const { data, error } = await supabaseClient.rpc('submit_skill_catalog_suggestion', {
      p_kind: kind,
      p_name: name,
      p_category: category
    });
    if (error) throw error;
    return data;
  },
  async submitSignupSuggestion(user) {
    const suggestion = user?.user_metadata?.catalog_suggestion;
    if (!suggestion) return false;
    if (pendingSignupSuggestionRequest?.userId === user.id) {
      return pendingSignupSuggestionRequest.promise;
    }
    if (!['skill', 'category'].includes(suggestion.kind) || typeof suggestion.name !== 'string') {
      throw new Error('The saved signup suggestion is incomplete.');
    }

    const request = (async () => {
      await this.submitSuggestion(suggestion.kind, suggestion.name, suggestion.category || null);
      const { error } = await supabaseClient.auth.updateUser({
        data: { catalog_suggestion: null }
      });
      if (error) {
        console.error('The signup suggestion was saved, but its account metadata could not be cleared:', error);
      }
      return true;
    })();
    pendingSignupSuggestionRequest = { userId: user.id, promise: request };
    try {
      return await request;
    } finally {
      if (pendingSignupSuggestionRequest?.promise === request) {
        pendingSignupSuggestionRequest = null;
      }
    }
  }
});
