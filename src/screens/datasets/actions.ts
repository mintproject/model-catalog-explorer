import { Action, ActionCreator } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../../app/store";
import { Dataset, DatasetDetail, DatasetQueryParameters } from "./reducers";
import { EXAMPLE_DATASETS_QUERY } from "../../offline_data/sample_datasets";
import { OFFLINE_DEMO_MODE } from "../../app/actions";
import { IdMap, MintPreferences } from "app/reducers";
import { DateRange } from "screens/modeling/reducers";
import { toTimeStamp, fromTimeStampToString, fromTimeStampToString2 } from "util/date-utils";
import { Region } from "screens/regions/reducers";

export const DATASETS_VARIABLES_QUERY = 'DATASETS_VARIABLES_QUERY';
export const DATASETS_GENERAL_QUERY = 'DATASETS_GENERAL_QUERY';
export const DATASETS_REGION_QUERY = 'DATASETS_REGION_QUERY';
export const DATASETS_RESOURCE_QUERY = 'DATASETS_RESOURCE_QUERY';
export const DATASET_ADD = 'DATASET_ADD';
export const DATASETS_LIST = 'DATASETS_LIST';

export interface DatasetsActionVariablesQuery extends Action<'DATASETS_VARIABLES_QUERY'> { 
    modelid: string, 
    inputid: string, 
    datasets: Dataset[] | null,
    loading: boolean
};
export interface DatasetsActionGeneralQuery extends Action<'DATASETS_GENERAL_QUERY'> { 
    query: DatasetQueryParameters,
    datasets: Dataset[] | null,
    loading: boolean
};
export interface DatasetsActionRegionQuery extends Action<'DATASETS_REGION_QUERY'> { 
    region: Region,
    datasets: Dataset[] | null,
    loading: boolean
};
export interface DatasetsActionDatasetResourceQuery extends Action<'DATASETS_RESOURCE_QUERY'> {
    dsid: string,
    dataset: Dataset,
    loading: boolean
};
export interface DatasetsActionDatasetAdd extends Action<'DATASET_ADD'> {
    dsid: string,
    dataset: Dataset,
};
export interface DatasetsActionDetail extends Action<'DATASETS_DETAIL'> { dataset: DatasetDetail };

export type DatasetsAction = DatasetsActionVariablesQuery | DatasetsActionGeneralQuery | DatasetsActionRegionQuery |
                             DatasetsActionDatasetResourceQuery | DatasetsActionDatasetAdd;

const getDatasetsFromDCResponse = (obj: any, queryParameters: DatasetQueryParameters) => {
    let datasets = obj.datasets.map(ds => {
        return {
            id: ds['dataset_id'],
            name: ds['dataset_name'] || '',
            region: '',
            variables: queryParameters.variables,
            datatype: ds['dataset_metadata']['datatype'] || '',
            time_period: {
                start_date: toTimeStamp(ds['dataset_metadata']['temporal_coverage']['start_time']),
                end_date: toTimeStamp(ds['dataset_metadata']['temporal_coverage']['end_time']),
            },
            description: ds['dataset_metadata']['dataset_description'] || '',
            version: ds['dataset_metadata']['version'] || '',
            limitations: ds['dataset_metadata']['limitations'] || '',
            source: {
                name: ds['dataset_metadata']['source'] || '',
                url: ds['dataset_metadata']['source_url'] || '',
                type: ds['dataset_metadata']['source_type'] || '',
            },
            categories: ds['categories'] || [],
            is_cached: ds['dataset_metadata']['is_cached'] || false,
            resource_repr: ds['dataset_metadata']['resource_repr'] || undefined,
            dataset_repr: ds['dataset_metadata']['dataset_repr'] || undefined,
            resource_count: ds['dataset_metadata']['resource_count'] || 0,
            spatial_coverage: ds['dataset_metadata']['dataset_spatial_coverage'] || null,
            resources: [],
        }
    });
    return datasets;
}

const getResourcesFromDCResponse = (obj: any) => {
    return obj.dataset.resources.map(row => {
        return {
            id: row["resource_id"],
            name: row["resource_name"],
            url: row["resource_data_url"],
            time_period: {
                start_date: toTimeStamp(row['resource_metadata']['temporal_coverage']['start_time']),
                end_date: toTimeStamp(row['resource_metadata']['temporal_coverage']['end_time'])
            },
            spatial_coverage: row["resource_metadata"]["spatial_coverage"],
            selected: true
        }
    });
}

const getResourceObjectsFromDCResponse = (obj: any, queryParameters: DatasetQueryParameters) => {
    let dsmap: IdMap<Dataset> = {};
    let datasets: Dataset[] = [];
    let dsresourcemap = {};

    obj.resources.map((row: any) => {
        let dmeta = row["dataset_metadata"];
        let rmeta = row["resource_metadata"];
        let tcover = rmeta["temporal_coverage"];
        let scover = rmeta["spatial_coverage"];
        let dsid = row["dataset_id"];
        let ds : Dataset = dsmap[dsid];
        let resourcemap = dsresourcemap[dsid];
        if(ds == null) {
            ds = {
                id: dsid,
                name: row["dataset_name"],
                region: "",
                variables: queryParameters.variables,
                time_period: {
                    start_date: null, //tcover["start_time"].replace(/T.+$/, ''),
                    end_date: null
                } as DateRange,
                description: row["dataset_description"] || "",
                version: dmeta["version"] || "",
                limitations: dmeta["limitations"] || "",
                is_cached: dmeta["is_cached"] || false,
                resource_repr: dmeta["resource_repr"] || undefined,
                dataset_repr: dmeta["dataset_repr"] || undefined,
                source: {
                    name: dmeta["source"] || "",
                    url: dmeta["source_url"] || "",
                    type: dmeta["source_type"] || ""
                },
                datatype: dmeta["datatype"] || dmeta["data_type"] || "",
                categories: dmeta["category_tags"] || [],
                resources: []
            };
            datasets.push(ds);
            dsmap[ds.id] = ds;
        }
        if (resourcemap == null) {
            resourcemap = {};
            dsresourcemap[dsid] = resourcemap;
        }
        let dataurl = row["resource_data_url"];
        if (resourcemap[dataurl]) // If this is a duplicate resource, ignore it
            return;
        resourcemap[dataurl] = true;
        
        let tcoverstart = tcover ? toTimeStamp(tcover["start_time"]) : null;
        let tcoverend = tcover ? toTimeStamp(tcover["end_time"]) : null;
        if(!ds.time_period.start_date || ds.time_period.start_date > tcoverstart) {
            ds.time_period.start_date = tcoverstart;
        }
        if(!ds.time_period.end_date || ds.time_period.end_date < tcoverend) {
            ds.time_period.end_date = tcoverend;
        }
        
        ds.resources.push({
            id: row["resource_id"],
            name: row["resource_name"],
            url: row["resource_data_url"],
            time_period: {
                start_date: tcoverstart,
                end_date: tcoverend
            },
            spatial_coverage: scover,
            selected: true
        });
    });
    return datasets;
}

const getDatasetObjectsFromDCResponse = (obj: any, queryParameters: DatasetQueryParameters) => {
    let datasets: Dataset[] = [];

    obj.datasets.map((row: any) => {
        let dmeta = row["dataset_metadata"];
        let dsid = row["dataset_id"];
        let ds : Dataset = {
            id: dsid,
            name: row["dataset_name"],
            region: "",
            variables: queryParameters.variables,
            time_period: {
                start_date: null, //tcover["start_time"].replace(/T.+$/, ''),
                end_date: null
            } as DateRange,
            description: row["dataset_description"] || "",
            version: dmeta["version"] || "",
            limitations: dmeta["limitations"] || "",
            is_cached: dmeta["is_cached"] || false,
            resource_repr: dmeta["resource_repr"] || undefined,
            dataset_repr: dmeta["dataset_repr"] || undefined,
            source: {
                name: dmeta["source"] || "",
                url: dmeta["source_url"] || "",
                type: dmeta["source_type"] || ""
            },
            datatype: dmeta["datatype"] || "",
            categories: dmeta["category_tags"] || [],
            resources: []
        };
        datasets.push(ds);
    });
    return datasets;
}

// Query Data Catalog by Variables
type QueryDatasetsThunkResult = ThunkAction<void, RootState, undefined, DatasetsActionVariablesQuery>;
export const queryDatasetsByVariables: ActionCreator<QueryDatasetsThunkResult> = 
        (modelid: string, inputid: string, driving_variables: string[], dates: DateRange, region: Region, 
            prefs:MintPreferences ) => (dispatch) => {
    
    if(OFFLINE_DEMO_MODE) {
        let datasets = [] as Dataset[];
        //console.log(driving_variables);
        EXAMPLE_DATASETS_QUERY.map((ds) => {
            let i=0;
            for(;i<driving_variables.length; i++) {
                if(ds.variables.indexOf(driving_variables[i]) >= 0) {
                    datasets.push(ds);
                    break;
                }
            }
        });
        if(driving_variables.length > 0) {
            dispatch({
                type: DATASETS_VARIABLES_QUERY,
                modelid: modelid,
                inputid: inputid,
                datasets: datasets,
                loading: false
            });        
        }
    }
    else {
        dispatch({
            type: DATASETS_VARIABLES_QUERY,
            modelid: modelid,
            inputid: inputid,
            datasets: null,
            loading: true
        });

        let geojson = JSON.parse(region.geojson_blob);
        fetch(prefs.data_catalog_api + "/datasets/find", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                standard_variable_names__in: driving_variables,
                spatial_coverage__intersects: geojson.geometry,
                end_time__gte: fromTimeStampToString(dates.start_date).replace(/\.\d{3}Z$/,''),
                start_time__lte: fromTimeStampToString(dates.end_date).replace(/\.\d{3}Z$/,''),
                limit: 5000
            })
        }).then((response) => {
            response.json().then((obj) => {
                let datasets: Dataset[] = getResourceObjectsFromDCResponse(obj, 
                    {variables: driving_variables} as DatasetQueryParameters)
                dispatch({
                    type: DATASETS_VARIABLES_QUERY,
                    modelid: modelid,
                    inputid: inputid,
                    datasets: datasets,
                    loading: false
                });
            })
        });
    }
};

const _createDatasetQueryData = (queryConfig: DatasetQueryParameters) => {
    var data = {};
    if(queryConfig.name) {
      data["dataset_names__in"] = [ queryConfig.name ];
    }
    if(queryConfig.variables) {
      data["standard_variable_names__in"] = queryConfig.variables;
    }
    data["limit"] = 5000;
    return data;
}


const _createResourceQueryData = (queryConfig: DatasetQueryParameters) => {
    var data = {};
    if(queryConfig.spatialCoverage) {
      data["spatial_coverage__intersects"] = [
          queryConfig.spatialCoverage.xmin, 
          queryConfig.spatialCoverage.ymin, 
          queryConfig.spatialCoverage.xmax, 
          queryConfig.spatialCoverage.ymax];
    }
    if(queryConfig.dateRange && queryConfig.dateRange.end_date) {
      data["end_time__gte"] = fromTimeStampToString2(queryConfig.dateRange.start_date);
    }
    if(queryConfig.dateRange && queryConfig.dateRange.start_date) {
      data["start_time__lte"] = fromTimeStampToString2(queryConfig.dateRange.end_date);
    }
    if(queryConfig.name) {
      data["dataset_names__in"] = [ queryConfig.name ];
    }
    if(queryConfig.variables) {
      data["standard_variable_names__in"] = queryConfig.variables;
    }
    data["limit"] = 5000;
    return data;
}


// Query Data Catalog Query for datasets
type QueryDatasetsGeneralThunkResult = ThunkAction<void, RootState, undefined, DatasetsActionGeneralQuery>;
export const queryGeneralDatasets: ActionCreator<QueryDatasetsGeneralThunkResult> = 
        (queryParameters: DatasetQueryParameters, prefs: MintPreferences ) => (dispatch) => {
    dispatch({
        type: DATASETS_GENERAL_QUERY,
        query: queryParameters,
        datasets: null,
        loading: true
    });
    let queryBody = _createDatasetQueryData(queryParameters);

    fetch(prefs.data_catalog_api + "/find_datasets", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        //mode: "no-cors",
        body: JSON.stringify(queryBody)
    }).then((response) => {
        response.json().then((obj) => {
            let datasets: Dataset[] = getDatasetObjectsFromDCResponse(obj, queryParameters)
            dispatch({
                type: DATASETS_GENERAL_QUERY,
                query: queryParameters,
                datasets: datasets,
                loading: false
            });
        })
    });
};

// Query Data Catalog for resources of a particular dataset
type QueryDatasetResourcesThunkResult = ThunkAction<void, RootState, undefined, DatasetsActionDatasetResourceQuery>;
export const queryDatasetResources: ActionCreator<QueryDatasetResourcesThunkResult> = 
        (dsid: string, region: Region, prefs: MintPreferences) => (dispatch) => {
    dispatch({
        type: DATASETS_RESOURCE_QUERY,
        dsid: dsid,
        dataset: null,
        loading: true
    });
    let queryBody = {
        "dataset_ids__in": [dsid],
        "limit": 200
    };
    /*if(region) {
        let geojson = JSON.parse(region.geojson_blob);
        queryBody["spatial_coverage__intersects"] = geojson.geometry;
    }*/
    let dataset: Dataset;
    let prom1 = new Promise((resolve, reject) => {
        let req = fetch(prefs.data_catalog_api + "/datasets/find", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            //mode: "no-cors",
            body: JSON.stringify(queryBody)
        });
        req.then((response) => {
            response.json().then((obj) => {
                let datasets: Dataset[] = getDatasetsFromDCResponse(obj, {})
                dataset = datasets.length > 0 ? datasets[0] : null;
                resolve();
            })
        });
        req.catch(reject);
    })

    let resources;
    let prom2 = new Promise((resolve, reject) => {
        let req = fetch(prefs.data_catalog_api + "/datasets/dataset_resources", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            //mode: "no-cors",
            body: JSON.stringify({
                dataset_id: dsid,
            })
        });
        req.then((response) => {
            response.json().then((obj) => {
                resources = getResourcesFromDCResponse(obj);
                resolve();
            })
        });
        req.catch(reject);
    });

    Promise.all([prom1, prom2]).then((values:any) => {
        dataset.resources = resources;
        dispatch({
            type: DATASETS_RESOURCE_QUERY,
            dsid: dsid,
            dataset: dataset,
            loading: false
        });
    });
};

// Query Data Catalog for resources of a particular dataset and save the results
type QueryDatasetResourcesAndSaveThunkResult = ThunkAction<void, RootState, undefined, DatasetsActionDatasetAdd>;
export const queryDatasetResourcesAndSave: ActionCreator<QueryDatasetResourcesAndSaveThunkResult> = 
        (dsid: string, region: Region, prefs: MintPreferences) => (dispatch) => {
    let queryBody = {
        "dataset_ids__in": [dsid],
        "limit": 2000
    };
    if(region) {
        let geojson = JSON.parse(region.geojson_blob);
        queryBody["spatial_coverage__intersects"] = geojson.geometry;
    }

    fetch(prefs.data_catalog_api + "/datasets/find", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(queryBody)
    }).then((response) => {
        response.json().then((obj) => {
            let datasets: Dataset[] = getDatasetsFromDCResponse(obj, {})
            let dataset = datasets.length > 0 ? datasets[0] : null
            dispatch({
                type: DATASET_ADD,
                dsid: dsid,
                dataset: dataset,
            });
        })
    });
};

// Query Data Catalog by Region
type QueryDatasetsByRegionThunkResult = ThunkAction<void, RootState, undefined, DatasetsActionRegionQuery>;
export const queryDatasetsByRegion: ActionCreator<QueryDatasetsByRegionThunkResult> = 
        (region: Region, prefs: MintPreferences) => (dispatch) => {
    dispatch({
        type: DATASETS_REGION_QUERY,
        region: region,
        datasets: null,
        loading: true
    });
    
    let geojson = JSON.parse(region.geojson_blob);
    let req1 = fetch(prefs.data_catalog_api + "/datasets/find", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            // FIXME: Querying the region for only datasets *within* the area
            // FIXME: on Dec16 within stoped working, going back to intersects but will 504
            spatial_coverage__intersects: geojson.geometry,
            //spatial_coverage__intersects: geojson.geometry, FIXME: this takes long to load.
            limit: 10
        })
    })

    let req2 = fetch(prefs.data_catalog_api + "/datasets/find", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            dataset_ids__in: ["adfca6fb-ad82-4be3-87d8-8f60f9193e43"],
            limit: 1
        })
    })

    Promise.all([req1, req2]).then((values:any) => {
        Promise.all(values.map(res => res.json())).then((objs:any) => {
            let datasets: Dataset[] = [];
            objs.forEach(obj => {
                datasets = datasets.concat( getDatasetsFromDCResponse(obj, {} as DatasetQueryParameters) )
            });
            dispatch({
                type: DATASETS_REGION_QUERY,
                region: region,
                datasets: datasets,
                loading: false
            });
        })
    });
};
