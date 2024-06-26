interface ISearchSiteItem {
  displayLink: string,
  link: string,
  title: string,
}

export interface ISearchDataOnSites {
  items?: ISearchSiteItem[],
  searchInformation: {
    totalResults: number
  }
}

export interface IFoundLink {
  title: string,
  link: string,
}

export interface ILink {
  site: string,
  result: IFoundLink | null,
}

export type MediaType = 'all' | 'movie' | 'tv'

export interface IPreviewDataItem {
  dataId: number,
  title: string,
  fullPosterUrl: string,
  mediaType: MediaType,
  releaseDate: string,
  vote: number,
}

export interface SearchState {
  results: IPreviewDataItem[],
  loading: boolean,
  lastSearch: string,
  page: number,
  totalPages: number,
}

export interface ISearchDataOnSitesResponse {
  items?: {
    displayLink: string,
    link: string,
    snippet: string,
    title: string,
  }[],
}

export enum SearchActionTypes {
  SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS',
  SET_SEARCH_LOADING = 'SET_SEARCH_LOADING',
  SET_LAST_SEARCH = 'SET_LAST_SEARCH',
  SET_SEARCH_PAGE = 'SET_SEARCH_PAGE',
  SET_SEARCH_TOTAL_PAGES = 'SET_SEARCH_TOTAL_PAGES',
}

interface setResults {
  type: SearchActionTypes.SET_SEARCH_RESULTS,
  payload: {
    results: IPreviewDataItem[],
    page: number,
  }
}

interface setLoading {
  type: SearchActionTypes.SET_SEARCH_LOADING,
  payload: boolean,
}

interface setLastSearch {
  type: SearchActionTypes.SET_LAST_SEARCH,
  payload: string,
}

interface setPage {
  type: SearchActionTypes.SET_SEARCH_PAGE,
  payload: number,
}

interface setTotalPages {
  type: SearchActionTypes.SET_SEARCH_TOTAL_PAGES,
  payload: number,
}

export type SearchAction = setResults | setLoading | setLastSearch | setPage | setTotalPages

export interface ISearchOnSitesResults {
  displayLink: string,
  link: string,
  snippet: string,
  title: string,
  found: IFoundedSitesResultsDetails | null,
}

export interface ISearchOnSitesFoundResults {
  displayLink: string,
  link: string,
  snippet: string,
  title: string,
  found: IFoundedSitesResultsDetails,
}

export interface IFoundedSitesResultsDetails {
  place: 'title' | 'snippet',
  title: string,
  similarity: number,
  includesYear: 'title' | 'snippet' | null,
}