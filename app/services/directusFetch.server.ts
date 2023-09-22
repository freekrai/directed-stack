function serializeSearchParams(obj: any, prefix = ''): string {
	const str:string[] = [];
	let p;
	for (p in obj) {
		// eslint-disable-next-line no-prototype-builtins
		if (obj.hasOwnProperty(p)) {
			const k = prefix ? prefix + '[' + p + ']' : p;
			const v = obj[p];
			str.push(
				v !== null && typeof v === 'object'
					? serializeSearchParams(v, k)
					: encodeURIComponent(k) + '=' + encodeURIComponent(v)
			);
		}
	}
	return str.join('&');
}

/**
 * Get full Directus URL from path
 * @param {string} path Path of the URL
 * @returns {string} Full Strapi URL
 */
export function getDirectusURL(path = "") {
	return `${process.env.DIRECTUS_URL || "http://localhost:6055"}${path}`
  }

/*
 * GraphQL-oriented fetch client....
 */
export const directusFetch = async ({ query, variables }: {query: any, variables: any}) => {
    let myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`);
    myHeaders.append("Content-Type", "application/json");

    var graphql = JSON.stringify({
        query: query,
        variables: variables || {}
    })

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow'
    };

    const result = await fetch(`${process.env.DIRECTUS_URL}/graphql`, {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow'
    }).then((res) => res.json());
    if (!result || !result.data) {
        console.error(result);
        return [];
    }
    return result.data;
};

/*
 const data = await directusFetch({
        query: `
          query {
            articles_by_id(id: ${id}){
              id
              title
              body
              excerpt
              publish_date
              cover_image {
                id
              }
              author{
                avatar {
                  id
                }
                id
                first_name
                last_name
              }  
            }
          }
        `,
        variables: {}
      });
      const post = data.articles_by_id || [
*/

// clear the directus cache
export const clearCache = async () => {
  const url = `${process.env.DIRECTUS_URL}/utils/cache/clear?access_token=${process.env.DIRECTUS_STATIC_TOKEN}`
  return fetch(url, {
    method: 'POST',
  });
}

/**
 * Helper to make POST requests to Directus API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @param {Object} payload body to post
 * @returns Parsed API call response
 */
export async function postAPI(path: string, urlParamsObject: {}, options = {}, payload = {}){
    const mergedOptions = {
      method: 'POST',
      body: JSON.stringify({
      "data": payload
      }),
      headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`,
      },
      ...options,
    }
    
      // check path
      let ppath = path;
      if( !path.startsWith("/") ){
          ppath = '/' + path;
      }

    // Build request URL
    const queryString = serializeSearchParams(urlParamsObject)
    const requestUrl = `${getDirectusURL(`/items${ppath}${queryString ? `?${queryString}` : ""}`)}`
    
    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions)
    
    // Handle response
    if (!response.ok) {
      console.error("ERROR >>> ", response.statusText)
      throw new Error(`An error occured please try again`)
    }
    const data = await response.json()
    return data
}
  
/**
 * Helper to make PUT requests to Directus API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @param {Object} payload body to post
 * @returns Parsed API call response
 */
export async function patchAPI(path: string, urlParamsObject: {}, options = {}, payload = {}){
    const mergedOptions = {
      method: 'PATCH',
      body: JSON.stringify({
        "data": payload
      }),
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`,
      },
      ...options,
    }
  
    let ppath = path;
    if( !path.startsWith("/") ){
      ppath = '/' + path;
    }
  
    
    // Build request URL
    const queryString = serializeSearchParams(urlParamsObject)
    const requestUrl = `${getDirectusURL(`/items${ppath}${queryString ? `?${queryString}` : ""}`)}`
    
    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions)
    
    // Handle response
    if (!response.ok) {
      console.error("ERROR >>> ", response.statusText)
      throw new Error(`An error occured please try again`)
    }
    const data = await response.json()
    return data
}  

  /**
 * Helper to make PUT requests to Directus API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @param {Object} payload body to post
 * @returns Parsed API call response
 */
export async function putAPI(path: string, urlParamsObject: {}, options = {}, payload = {}){
	const mergedOptions = {
	  method: 'PUT',
	  body: JSON.stringify({
		  "data": payload
	  }),
	  headers: {
		  "Content-Type": "application/json",
		  'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`,
	  },
	  ...options,
	}

  let ppath = path;
  if( !path.startsWith("/") ){
    ppath = '/' + path;
  }

  
	// Build request URL
	const queryString = serializeSearchParams(urlParamsObject)
	const requestUrl = `${getDirectusURL(`/items${ppath}${queryString ? `?${queryString}` : ""}`)}`
  
	// Trigger API call
	const response = await fetch(requestUrl, mergedOptions)
  
	// Handle response
	if (!response.ok) {
	  console.error("ERROR >>> ", response.statusText)
	  throw new Error(`An error occured please try again`)
	}
	const data = await response.json()
	return data
}

export async function userLogin(email: string, password: string) {
    const urlParamsObject = {};
    const options = {};

    const payload = {
        email,
        password,
    }

    // Merge default and user options
    const mergedOptions = {
        method: 'POST',
        body: JSON.stringify({
            "data": payload
        }),  
        headers: {
            "Content-Type": "application/json",
            //'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`,
        },
        ...options,
    }

    const path = '/auth/login';
    let ppath = path;
    
    if( !path.startsWith("/") ){
        ppath = '/' + path;
    }

    // Build request URL
    const queryString = serializeSearchParams(urlParamsObject)
    const requestUrl = `${getDirectusURL(`${ppath}${queryString ? `?${queryString}` : ""}`)}`
    //console.log(requestUrl);

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions)

    // Handle response
    if (!response.ok) {
        console.error(response.statusText)
        throw new Error(`An error occured please try again`)
    }
    const data = await response.json()
    return data
}

export async function getMe(token: string) {
    const urlParamsObject = {};
    const options = {};

    // Merge default and user options
    const mergedOptions = {
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
        },
        ...options,
    }

    const path = '/auth/login';
    let ppath = path;
    if( !path.startsWith("/") ){
        ppath = '/' + path;
    }

    // Build request URL
    const queryString = serializeSearchParams(urlParamsObject)
    const requestUrl = `${getDirectusURL(`${ppath}${queryString ? `?${queryString}` : ""}`)}`
    //console.log(requestUrl);

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions)

    // Handle response
    if (!response.ok) {
        console.error(response.statusText)
        throw new Error(`An error occured please try again`)
    }

    const data = await response.json()
    return data
}

/**
 * Helper to make GET requests to Directus API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @returns Parsed API call response
 */
export async function fetchAPI(path: string, urlParamsObject = {}, options = {}) {
    // Merge default and user options
    const mergedOptions = {
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`,
        },
        ...options,
    }

    let ppath = path;
    if( !path.startsWith("/") ){
        ppath = '/' + path;
    }

    // Build request URL
    const queryString = serializeSearchParams(urlParamsObject)
    const requestUrl = `${getDirectusURL(`/items${ppath}${queryString ? `?${queryString}` : ""}`)}`
    //console.log(requestUrl);

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions)

    // Handle response
    if (!response.ok) {
        console.error(response.statusText)
        throw new Error(`An error occured please try again`)
    }

    const data = await response.json()
    return data
}

export function getAssetURL(image: any, urlParamsObject = {} ) {
    if (!image) return null;

    let id = image;
    if ( typeof image === 'object' ) { 
        id = image.id;
    }

    if (!id) return null;
    let queryString = serializeSearchParams(urlParamsObject)
    return `${process.env.DIRECTUS_URL}/assets/${id}${queryString ? `?${queryString}` : ""}`;
}


export const filterDataToSingleItem = (data = []) => {
    if (!Array.isArray(data)) {
        return data;
    }

    if (data.length === 1) {
        return data[0];
    }
    return data[0];
}


interface QueryOptions {
    access_token?: string;
    filter?: DeepParam;
    fields?: string | string[];
    sort?: string | string[];
    search?: string;
    limit?: number;
    offset?: number;
    page?: number;
    aggregate?: Record<string, string>;
    deep?: DeepParam;
    alias?: Record<string, string>;
    export?: "json" | "csv" | "xml";
    meta?: "total_count" | "filter_count" | "*";
}

interface DeepParam {
    [key: string]: string | number | DeepParam;
}

type SimpleParam = typeof simpleParams[number];
type DeepParamName = typeof deepParams[number];
type StrArrParam = typeof strArrParams[number];

const strArrParams = ["fields", "sort"] as const;
const simpleParams = [
  "access_token",
  "search",
  "limit",
  "offset",
  "page",
  "export",
  "meta",
] as const;
const deepParams = ["filter", "deep"] as const;
const recordParams = ["aggregate", "alias"] as ["aggregate", "alias"];

interface FileOptions {
  access_token?: string;
  key?: string;
  fit?: "cover" | "contain" | "inside" | "outside";
  width?: number;
  height?: number;
  quality?: number;
  withoutEnlargement?: boolean;
  format?: "jpg" | "png" | "webp" | "tiff";
}

const fileOptionNames = [
  "access_token",
  "key",
  "fit",
  "width",
  "height",
  "quality",
  "withoutEnlargement",
  "format",
] as const;

type AdvancedTransformations = [string, unknown][];

export class LiteSdk {
  readonly apiUrl: string;
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  query(path: string, params?: QueryOptions) {
    const queryString = getQueryParams(params);
    return `${this.apiUrl}/${path}${queryString}`;
  }
  fileUrl(
    id: string,
    options = {} as FileOptions,
    advanced = [] as AdvancedTransformations,
  ): string {
    if (!options.withoutEnlargement) delete options.withoutEnlargement;
    const transforms = advanced.length
      ? ["transforms=" + JSON.stringify(advanced)]
      : [];
    const params = transforms.concat(
      fileOptionNames.filter((name) => name in options).map(
        (name) => `${name}=${options[name]}`,
      ),
    );
    const strParams = params.length ? `?${params.join("&")}` : "";
    return `${this.apiUrl}/assets/${id}${strParams}`;
  }
}

export function getQueryParams(options?: QueryOptions): string {
  const opts = options || ({} as QueryOptions);
  const query = [
    ...strArrParams.map(renderStrArray),
    ...simpleParams.map(renderSimpleParam),
    ...deepParams.map(renderDeep),
    ...recordParams.map(renderRecord),
  ]
    .filter((x) => x)
    .join("&");
  return query ? "?" + query : "";

  function renderSimpleParam(name: SimpleParam): string {
    return opts[name] ? `${name}=${opts[name]}` : "";
  }

  function renderStrArray(name: StrArrParam): string {
    const value = opts[name];
    return !value
      ? ""
      : `${name}=${Array.isArray(value) ? value.join(",") : value}`;
  }

  function renderDeep(name: DeepParamName): string {
    return opts[name] ? `${name}=${JSON.stringify(opts[name])}` : "";
  }

  function renderRecord(name: "aggregate" | "alias"): string {
    const records = opts[name];
    return !records ? "" : Object.keys(records)
      .map((key) => `${name}[${key}]=${records[key]}`)
      .join("&");
  }
}

export default LiteSdk;