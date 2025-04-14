/**
 * Mocks pour les API du système de recherche
 * Ce fichier fournit des données fictives pour les tests
 */

// Réponse mock pour GET /api/admin/search/data
const searchDataMock = {
  totalSearches: 2583,
  uniqueTerms: 547,
  timeline: [
    { date: '2023-01-01', count: 120 },
    { date: '2023-01-02', count: 134 },
    { date: '2023-01-03', count: 98 },
    // ... autres données de timeline
  ],
  topTerms: [
    { term: 'intelligence artificielle', count: 236, lastSearched: '2023-01-03T14:23:45Z' },
    { term: 'génération vidéo', count: 188, lastSearched: '2023-01-03T15:12:30Z' },
    { term: 'transcription audio', count: 145, lastSearched: '2023-01-03T10:42:18Z' },
    { term: 'montage vidéo ia', count: 132, lastSearched: '2023-01-03T09:15:22Z' },
    { term: 'traduction automatique', count: 117, lastSearched: '2023-01-02T22:07:11Z' },
  ],
  emptySearches: [
    { term: 'deepfak', count: 12, suggestion: 'deepfake' },
    { term: 'video generation frances', count: 8, suggestion: 'génération vidéo français' },
    { term: 'ia trancription', count: 5, suggestion: 'ia transcription' },
  ]
};

// Réponse mock pour GET /api/admin/search/pages
const searchPagesMock = [
  {
    id: 'clj2k3m4p000a01l28xjrfg7d',
    keyword: 'intelligence artificielle vidéo',
    slug: 'intelligence-artificielle-video',
    description: 'Les meilleurs outils d\'IA pour la vidéo',
    seoTitle: 'Top 10 outils d\'intelligence artificielle pour la vidéo en 2023',
    metaDescription: 'Découvrez les meilleurs outils d\'IA pour créer, éditer et améliorer vos vidéos. Comparatif complet des solutions d\'intelligence artificielle pour la vidéo.',
    isActive: true,
    searchCount: 236,
    lastSearchedAt: '2023-01-03T14:23:45Z',
    createdAt: '2022-12-15T10:30:00Z',
    updatedAt: '2023-01-02T09:15:22Z',
    tools: [
      { id: 'tool1', name: 'VideoGen AI', relevance: 0.95 },
      { id: 'tool2', name: 'SmartEdit Pro', relevance: 0.87 },
      { id: 'tool3', name: 'DeepMotion', relevance: 0.82 },
    ]
  },
  {
    id: 'clj2k3m4p000b01l28dmrf45e',
    keyword: 'transcription audio texte',
    slug: 'transcription-audio-texte',
    description: 'Outils de transcription audio vers texte',
    seoTitle: 'Meilleurs outils de transcription audio en texte automatique',
    metaDescription: 'Convertissez vos fichiers audio en texte avec ces outils de transcription automatique alimentés par l\'IA. Rapides, précis et économiques.',
    isActive: true,
    searchCount: 145,
    lastSearchedAt: '2023-01-03T10:42:18Z', 
    createdAt: '2022-12-20T14:45:00Z',
    updatedAt: '2022-12-28T11:20:15Z',
    tools: [
      { id: 'tool4', name: 'TranscriptAI', relevance: 0.98 },
      { id: 'tool5', name: 'VoiceScribe', relevance: 0.91 },
      { id: 'tool6', name: 'AudioText Pro', relevance: 0.85 },
    ]
  }
];

// Mock pour POST /api/admin/search/data (création d'un terme)
function createSearchTermMock(term) {
  return {
    success: true,
    data: {
      id: `mock-id-${Date.now()}`,
      keyword: term,
      slug: term.toLowerCase().replace(/\s+/g, '-'),
      searchCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

// Mock pour POST /api/admin/search/pages (création d'une page)
function createSearchPageMock(pageData) {
  return {
    success: true,
    data: {
      id: `mock-page-id-${Date.now()}`,
      ...pageData,
      slug: pageData.keyword.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

// Comment utiliser ces mocks dans les tests
/*
// Exemple avec Jest
jest.mock('next/api', () => ({
  fetch: jest.fn((url) => {
    if (url.includes('/api/admin/search/data')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(searchDataMock)
      });
    }
    if (url.includes('/api/admin/search/pages')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(searchPagesMock)
      });
    }
    return Promise.reject(new Error('Not found'));
  })
}));
*/

module.exports = {
  searchDataMock,
  searchPagesMock,
  createSearchTermMock,
  createSearchPageMock
}; 