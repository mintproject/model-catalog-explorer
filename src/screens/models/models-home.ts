
import { html, customElement, property, css } from 'lit-element';
import { PageViewElement } from '../../components/page-view-element';

import { SharedStyles } from '../../styles/shared-styles';
import { RootState, store } from '../../app/store';
import models, { ModelDetail, Model } from './reducers';
import { connect } from 'pwa-helpers/connect-mixin';
import { listAllModels } from './actions';

import "weightless/card";
import "./model-explore/model-explore";

store.addReducers({
    models
});

@customElement('models-home')
export class ModelsHome extends connect(store)(PageViewElement) {
    @property({type: Object})
    private _model!: ModelDetail | null;

    @property({type: Object})
    private _models: Map<String, Map<String, Model[]>> = {} as Map<String, Map<String, Model[]>>;

    static get styles() {
        return [
            css `
            `,
            SharedStyles
        ];
    }

    protected render() {
        return html`<div>
            <model-explorer class="page fullpage" ?active="${this._subpage == 'explore'}"></model-explorer>
            ${this._subpage == 'home' ? this._renderHome() : html`` }
        </div>`
    }

    _renderHome () {
        return html`
            <wl-title level="3">Prepare Models</wl-title>
            <p>
                This section allows you to:
                <ul>
                    <li><a href="/models/explore">Browse models in the system</a></li>
                    <li>Incorporate new models</li>
                    <li>Configure existing models</li>
                    <li>Use automated methods to calibrate models for particular regions</li>
                </ul>
            </p>        
            ${this._model && this._model.name ? 
                html`
                <h2>${this._model.name}</h2>
                Details about the model here
                `
                : html ``
            }
            ${Object.keys(this._models).map((category) => {
                let category_models = this._models[category];
                return html`
                <wl-title level="4">${category}</wl-title>
                <table class="pure-table pure-table-bordered">
                    <thead>
                        <th>Model</th>
                        <th>Model Configuration</th>
                        <th>Model Description</th>
                        <th>Model Type</th>
                        <th>Dimensionality</th>
                        <th>Spatial Grid</th>
                    </thead>
                    <tbody>
                    ${Object.keys(category_models).map((original_model) => {
                        let models = category_models[original_model];
                        let i=0;
                        return html`
                        ${models.map((model: Model) => {
                            i++;
                            return html`
                            <tr>
                                ${i == 1 ? html`<td rowspan="${models.length}">${original_model}</td>`: html``}
                                <td>${model.name}</td>
                                <td>${model.description}</td>
                                <td>${model.model_type}</td>
                                <td>${model.dimensionality}D</td>
                                <td>${model.spatial_grid_type} : ${model.spatial_grid_resolution}</td>
                            </tr>
                            `;
                        })}
                        `;
                    })}
                    </tbody>
                </table>
                <br />
                `;
            })}
        `;
    }

    firstUpdated() {
        store.dispatch(listAllModels());
    }

    stateChanged(state: RootState) {
        super.setSubPage(state);
        if(state.models && state.models.model) {
            this._model = state.models.model;
            //console.log(this._model);
        }
        if(state.models && state.models.models && state.models.models["*"]) {
            this._model = state.models.model;
            this._models = {} as Map<String, Map<String, Model[]>>;
            state.models.models["*"].map((model : Model) => {
                if(!this._models[model.category])
                        this._models[model.category] = {};
                if(!this._models[model.category][model.original_model])
                    this._models[model.category][model.original_model] = [];
                this._models[model.category][model.original_model].push(model);
            });
        }
    }
}
