import { ThunkAction } from "redux-thunk";
import { RootState } from "../../app/store";
import { ActionCreator, Action } from "redux";
import { EXAMPLE_REGION_DATA } from "../../offline_data/sample_scenarios";
import { db } from "../../config/firebase";
import { RegionList, Region } from "./reducers";
import { OFFLINE_DEMO_MODE } from "../../app/actions";

export const REGIONS_LIST = 'REGIONS_LIST';
export const REGIONS_QUERY = 'REGIONS_QUERY';
//export const REGIONS_ADD = 'REGIONS_ADD';

export interface RegionsActionList extends Action<'REGIONS_LIST'> { list: RegionList };
export interface RegionsActionQuery extends Action<'REGIONS_QUERY'> { 
    parent_id: string, region_type: string, list: RegionList 
};
//export interface RegionsActionAdd extends Action<'REGIONS_ADD'> { loading: boolean };

export type RegionsAction =  RegionsActionList | RegionsActionQuery;

// List Regions
type ListRegionsThunkResult = ThunkAction<void, RootState, undefined, RegionsActionList>;
export const listTopRegions: ActionCreator<ListRegionsThunkResult> = () => (dispatch) => {
    // Here you would normally get the data from the server. We're simulating
    // that by dispatching an async action (that you would dispatch when you
    // succesfully got the data back)
    if(OFFLINE_DEMO_MODE) {
        dispatch({
            type: REGIONS_LIST,
            list: EXAMPLE_REGION_DATA
        });
        return;
    }

    db.collection("regions").get().then((querySnapshot) => {
        let regions:RegionList = {};
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            data.id = doc.id;
            regions[doc.id] = data as Region;
        });
        dispatch({
            type: REGIONS_LIST,
            list: regions
        });
    });
};

// Query Regions
type QueryRegionsThunkResult = ThunkAction<void, RootState, undefined, RegionsActionQuery>;
export const queryRegions: ActionCreator<QueryRegionsThunkResult> = (parentid: string, type: string) => (dispatch) => {
    // Here you would normally get the data from the server. We're simulating
    // that by dispatching an async action (that you would dispatch when you
    // succesfully got the data back)
    if(OFFLINE_DEMO_MODE) {
        dispatch({
            type: REGIONS_QUERY,
            parent_id: parentid,
            region_type: type,
            list: EXAMPLE_REGION_DATA
        });
        return;
    }
    console.log("Querying " + type +" regions for " + parentid);
    // FIXME: Make this a listener like scenario 
    // - Think of ramifications ? (could this be called multiple times ?)

    let collRef : firebase.firestore.CollectionReference | firebase.firestore.Query
    = db.collection("regions/"+parentid+"/subregions");
    
    if(type) {
        collRef = collRef.where("region_type", "==", type);
    }
    
    collRef.onSnapshot((querySnapshot) => {
        let regions:RegionList = {};
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            data.id = doc.id;
            regions[doc.id] = data as Region;
        });
        dispatch({
            type: REGIONS_QUERY,
            parent_id: parentid,
            region_type: type,
            list: regions
        });
    });
};

function chunkRegions(array: Region[], size: number) {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
}

export const addRegions = (parent_regionid: string, regions: Region[]) : Promise<void[]> =>  {
    let chunks = chunkRegions(regions, 500);
    let subregionsRef = db.collection("regions/" + parent_regionid + "/subregions");
    return Promise.all(
        chunks.map((regionlist) => {
            let batch = db.batch();
            regionlist.map((region) => {
                batch.set(subregionsRef.doc(), region);
            })
            return batch.commit();
        })
    );
};