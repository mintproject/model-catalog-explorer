/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { LitElement, html, property, PropertyValues, customElement, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin';
import { installRouter } from 'pwa-helpers/router';
import { updateMetadata } from 'pwa-helpers/metadata';

// This element is connected to the Redux store.
import { store, RootState } from './store';

// These are the actions needed by this element.
import {
  navigate, fetchUser, signOut, signIn, signUp, goToPage, fetchMintConfig, setUserProfile, resetPassword,
} from './actions';
import { UserPreferences, UserProfile } from './reducers';
import { listTopRegions, listSubRegions, listRegionCategories } from '../screens/regions/actions';

import { modelsGet, versionsGet, modelConfigurationsGet, modelConfigurationSetupsGet, processesGet, 
         regionsGet, imagesGet } from 'model-catalog/actions';
import 'components/notification';

import "weightless/popover";
import "weightless/radio";
import { Select } from 'weightless/select';
import { Radio } from 'weightless/radio';

import { Popover } from "weightless/popover";
import { CustomNotification } from 'components/notification';
import 'components/notification';

import { SharedStyles } from '../styles/shared-styles';
import { showDialog, hideDialog, formElementsComplete } from '../util/ui_functions';
import { User } from 'firebase';
import { getLabel } from 'model-catalog/util';

import '../screens/models/models-home';
import './mint-about';
import 'weightless/nav'
import 'weightless/title'

@customElement('mint-app')
export class MintApp extends connect(store)(LitElement) {
  @property({type: String})
  appTitle = '';

  @property({type: String})
  private _page = '';

  @property({type: String})
  private _subpage = '';

  @property({type: String}) private _selectedModel = '';
  @property({type: String}) private _selectedVersion = '';
  @property({type: String}) private _selectedConfig = '';
  @property({type: String}) private _selectedSetup = '';
  private _mainRegion = '';

  @property({type: String})
  private _defGraph = '';

  @property({type: Boolean})
  private _creatingAccount = false;

  @property({type: Boolean})
  private _resetingPassword = false;

  @property({type:Boolean})
  private _drawerOpened = false;

  @property({type:Boolean})
  private _infoActive = true;

  @property({type: Object})
  private user!: User;

  @property({type: Object})
  private _model;

  @property({type: Array})
  private _topRegions : string[] = [];

  private _dispatchedRegionsQuery : boolean = false;
  private _dispatchedSubRegionsQuery : boolean = false;
  private _dispatchedVariablesQuery : boolean = false;

  private _loggedIntoWings = false;

  private _dispatchedConfigQuery = false;
  
  static get styles() {
    return [
      SharedStyles,
      css`
      .appframe {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }

      .sectionframe {
        display: flex;
        height: 100%;
        width: 100%;
        overflow: auto;
      }

      div#left {
        top: 0;
        bottom: 0;
        left: 0;
        background-color: #06436c;
        color: white;
        width: 0px;
        overflow: auto;
        transition: width 0.2s;
      }

      div#left.open {
        display: block;
        width: 400px;
      }

      div#right {
        top: 0;
        bottom: 0;
        width: 100%;
        transition: width 0.2s;
      }
      
      .breadcrumbs {
        margin-left: 0px;
      }

      .breadcrumbs a.active {
        background-color: #86181a;
        color: white;
      }
      .breadcrumbs a.active:before {
        border-color: #86181a;
        border-left-color: transparent;
      }
      .breadcrumbs a.active:after {
        border-left-color: #86181a;
      }

      .breadcrumbs a:first {
        background-color: #629b30;
        color: white;
      }
      .breadcrumbs a:first:before {
        border-color: #629b30;
        border-left-color: transparent;
      }
      .breadcrumbs a:first:after {
        border-left-color: #629b30;
      }

      .message-button {
        --button-padding: 6px;
      }
      .message-button.selected {
        background-color: #86181a;
        color: white;
      }
      .message-button.selected:hover {
        background-color: #86181a;
      }
      .message-button:hover {
        background-color: rgb(224, 224, 224);
      }
      #breadcrumbs-menu-button {
        display:none;
      }
      .small-screen {
        display: none;
      }

      @media (max-width: 1024px) {
        #main-breadcrumbs {
          display: none;
        }
        #breadcrumbs-menu-button {
          display: inline-block;
        }
        #breadcrumbs-popover wl-button {
          display: block;
        }
        #main-breadcrumbs .emulator-button {
          display: none;
        }
        wl-nav {
          --nav-padding: 0px;
        }
        wl-button.active {
          --button-bg: #629b30 !important;
        }
        .emulators-button {
          display: none;
        }
        .small-screen {
          display: flex;
        }
        .sectionframe {
          display: block;
          height: 100%;
          width: 100%;
          overflow: auto;
          background: #F6F6F6;
        }
      }

      #info {
        margin: 0px auto 10px;
        background: #f0f0f0;
        width: calc(75% - 40px);
        border-radius: 1em;
        padding: 10px 20px;
      }

      #info wl-icon {
          float: right;
          cursor: pointer;
          color: #B8B8B8;
      }

      #info wl-icon:hover {
          color: black;
      }

      #info > div.cont {
          padding: 25px 10px 10px 10px;
      }

    .no-decoration, .no-decoration:hover {
        text-decoration: none;
    }

    #back-button {
        padding: 4px 4px 4px 10px;
        border-radius: 0;
        background: rgb(240, 240, 240);
    }   

    #back-button:hover {
        background-color: rgb(224, 224, 224);
    }
    
    .nav-buttons > wl-button {
        --font-family-sans-serif: Montserrat;
    }`
    ];
  }

  _onConfigureClick () {
    let url = 'models/configure';
    if (this._selectedModel) {
        url += '/' + this._selectedModel.split('/').pop();
        if (this._selectedVersion) {
            url += '/' + this._selectedVersion.split('/').pop();
            if (this._selectedConfig) {
                url += '/' + this._selectedConfig.split('/').pop();
                if (this._selectedSetup) 
                    url += '/' + this._selectedSetup.split('/').pop();
            }
        }
    }
    goToPage(url);
  }

  protected render() {
    let nav = [{label:'Model Explorer', url:'home'}] 
    switch (this._subpage) {
        case 'explore':
            if (this._selectedModel) {
                let modelId : string = this._selectedModel.split('/').pop();
                let label : string = this._model && this._model.label ?
                        this._model.label[0] : modelId.replace(/_/g,' ');
                nav.push({label: label, url: 'models/explore/' + modelId});
            }
            break;
        case 'configure':
            nav.push({label: 'Model Configuration', url: 'models/configure'});
            break;
        default:
            break;
    }

    // Anything that's related to rendering should be done in here.
    return html`
    <!-- Overall app layout -->
    <custom-notification id="custom-notification"></custom-notification>

    <div class="appframe">
      <!-- Navigation Bar -->
      <wl-nav>
        <div slot="title">
            <wl-button id="back-button" flat inverted @click="${()=>goToPage('home')}" ?disabled="${this._page === 'home'}">
                <wl-icon>arrow_back_ios</wl-icon>
            </wl-button>
        
            <ul class="breadcrumbs">
              <a href="/home"
                  class=${(this._page == 'home' ? 'active' : '')}>
                  <div style="vertical-align:middle">
                    Model catalog
                  </div>
              </a>
              ${(this._selectedModel && !(this._page == 'home' || this._page == 'about'))?
                    html`<a class="active">
                        ${this._model ? (getLabel(this._model)) :
                            this._selectedModel.split('/').pop().replace(/_/g,' ')}
                    </a>` : html``}
            </ul>

        </div>

        <div slot="right" class="nav-buttons">
        <wl-button flat inverted class="message-button ${this._subpage == 'configure' ? 'selected' : ''}" 
                   @click="${this._onConfigureClick}">
            Configure models <wl-icon style="margin-left: 4px;">settings</wl-icon>
        </wl-button>

          ${this.user == null ? 
            html`
            <wl-button flat inverted @click="${this._showLoginWindow}">
              LOGIN &nbsp;
              <wl-icon alt="account">account_circle</wl-icon>
            </wl-button>
            `
            :
            html `
            <wl-button id="user-button" flat inverted @click="${this._onUserButtonClicked}">
               ${this.user.email}
            </wl-button>
            <wl-popover id="user-popover" anchor="#user-button" fixed
                transformOriginX="right" transformOriginY="top" anchorOriginX="right" anchorOriginY="bottom">
                <div style="background: #fff; padding: 5px 10px; border: 1px solid #ddd; border-radius: 3px; display: flex; flex-direction: column;">
                    <wl-button flat inverted @click="${this._showConfigWindow}"> CONFIGURE </wl-button>
                    <wl-button flat inverted @click="${signOut}"> LOGOUT </wl-button>
                </div>
            </wl-popover>
            `
          }
        </div>

        <wl-button style="padding: 0px 5px;" flat inverted slot="right" @click="${()=>goToPage('about')}">
          <img style="margin-left: 6px;" height="40" src="/images/WIFIRE_LOGO.png">
        </wl-button>
      </wl-nav>

        <div class="sectionframe">
          <div id="right">
            <div class="card">
              <!-- Main Pages -->

            <nav-title .nav="${nav}" max="2">
                <a slot="after" class="no-decoration" target="_blank" href="${this._getHelpLink()}">
                    <wl-button style="--button-padding: 8px;">
                        <wl-icon style="margin-right: 5px;">help_outline</wl-icon>
                        <b>Documentation</b>
                    </wl-button>
                </a>
            </nav-title>

              ${(false && this._page == 'home' && this._infoActive) ? html`
              <div id="info">
                <div> <wl-icon @click="${()=>{this._infoActive = false;}}">clear<wl-icon> </div>
                <div class="cont"> 
                    <p>
                        The <b>MINT Model Explorer</b> is an application for finding and exploring software models 
                        and metadata available in the MINT Model Catalog.<br/>
                        We are currently adding new models and metadata, so this is work in progress.
                        Click <a href="/about">here</a> to know more.
                    <p>We <b>recommend using the MINT Model Explorer in Chrome.</b></p>
                </div>
              </div>
              ` : html``}

              <mint-about class="page fullpage" ?active="${this._page == 'about'}"></mint-about>
              <model-explorer class="page"
                              ?active="${this._page != 'about' && this._subpage != 'configure'}"></model-explorer>
              <models-configure class="page" ?active="${this._subpage == 'configure'}"></models-configure>
            </div>
          </div>
        </div>
    </div>

    ${this._renderLoginDialog()}
    ${this._renderConfigureUserDialog()}
    `;
  }

    private _getHelpLink () {
        let uri : string = 'https://mintproject.readthedocs.io/en/latest/modelcatalog/';
        if (this._selectedSetup)
            return uri + '#model-configuration-setup';
        if (this._selectedConfig)
            return uri + '#model-configuration';
        return uri;
    }

  _onUserButtonClicked () {
    let pop : Popover = this.shadowRoot.querySelector("#user-popover");
    if (pop) pop.show();//.then(result => console.log(result));
  }

  _onBreadcrumbsMenuButtonClicked () {
    let pop : Popover = this.shadowRoot.querySelector("#breadcrumbs-popover");
    if (pop) pop.show();//.then(result => console.log(result));
  }

  _renderLoginDialog() {
    return html`
    <wl-dialog id="loginDialog" fixed backdrop blockscrolling>
      <h3 slot="header">
        ${this._creatingAccount ? 
          'Choose an email and password for your account' :
          (this._resetingPassword ? 
            'Enter your email to reset your password'
            : 'Please enter your email and password')}
      </h3>
      <div slot="content">
        <p></p>
        <form id="loginForm">
          <div class="input_full">
            <label>Email</label>
            <input name="username" type="email"></input>
          </div>
          ${this._resetingPassword ? '' : html`
          <p></p>
          <div class="input_full">
            <label>Password</label>
            <input name="password" type="password" @keyup="${this._onPWKey}"></input>
          </div>
          `}
        </form>
        ${this._creatingAccount || this._resetingPassword ? 
            ''
            : html`<p></p><a @click="${() => {this._resetingPassword = true;}}">Reset your password</a>`}
      </div>
      <div slot="footer" style="justify-content: space-between;">
          ${this._creatingAccount || this._resetingPassword ? 
            html`<span></span>` :
            html`<wl-button @click="${this._createAccountActivate}">Create account</wl-button>`}
          <span>
              <wl-button @click="${this._onLoginCancel}" inverted flat>Cancel</wl-button>
              <wl-button @click="${this._onLogin}" class="submit" id="dialog-submit-button">
                  ${this._resetingPassword ? 'Reset password' : 'Submit'}
              </wl-button>
          </span>
      </div>
    </wl-dialog>
    `;
  }

  _renderConfigureUserDialog () {
    return html`
    <wl-dialog id="configDialog" fixed backdrop blockscrolling>
      <h3 slot="header">
          Configure your account
      </h3>
      <div slot="content">
        <p></p>

        <wl-label>Model catalog graph:</wl-label>
        <div style="margin-top: 4px;">

            <wl-radio id="gpublic" name="graph" ?checked=${!this._defGraph}></wl-radio>
            <wl-label for="gpublic" style="padding: 5px;"> Public graph (mint@isi.edu) </wl-label>
        </div>
        <div style="margin-top: 4px;">
            <wl-radio id="gpersonal" name="graph" ?checked=${this.user && this.user.email == this._defGraph}></wl-radio>
            <wl-label for="gpersonal" style="padding: 5px;"> My graph </wl-label>
        </div>
      </div>

      <div slot="footer">
        <wl-button @click="${this._onConfigCancel}" inverted flat>Cancel</wl-button>
        <wl-button @click="${this._onConfigSave}" class="submit">Save</wl-button>
      </div>
    </wl-dialog>
    `;
  }

  _onPWKey (e:KeyboardEvent) {
      if (e.code === "Enter") {
          this._onLogin();
      }
  }

  _showLoginWindow() {
    showDialog("loginDialog", this.shadowRoot!);
  }

  _showConfigWindow() {
    showDialog("configDialog", this.shadowRoot!);
  }

  _createAccountActivate () {
    this._creatingAccount = true;
  }

  _onConfigCancel () {
        hideDialog("configDialog", this.shadowRoot!);
  }

  _onConfigSave () {
    let inputPublicGraph : Select  = this.shadowRoot.getElementById('gpublic') as Select;
    let inputPrivateGraph : Radio  = this.shadowRoot.getElementById('gpersonal') as Radio;
    let notification : CustomNotification = this.shadowRoot.querySelector<CustomNotification>("#custom-notification")!;
    if (inputPublicGraph && inputPrivateGraph) {
        let profile : UserProfile = {
            graph: inputPrivateGraph.checked ? this.user.email : ''
        }
        console.log('new profile:', profile);
        store.dispatch(
            setUserProfile(this.user, profile)
        ).then(() => {
            if (notification) notification.save("Saved");
            this._onConfigCancel();
            window.location.reload(false);
        }).catch((error) => {
            if (notification) notification.error("Could not save changes.");
        });
    }
  }

  _onLoginCancel() {
    if (!this._creatingAccount && !this._resetingPassword) {
        hideDialog("loginDialog", this.shadowRoot!);
    }
    this._creatingAccount = false;
    this._resetingPassword = false;
  }

  _onLogin() {
    let form:HTMLFormElement = this.shadowRoot!.querySelector<HTMLFormElement>("#loginForm")!;
    let notification : CustomNotification = this.shadowRoot.querySelector<CustomNotification>("#custom-notification")!;
    if (!this._resetingPassword && formElementsComplete(form, ["username", "password"])) {
        let username = (form.elements["username"] as HTMLInputElement).value;
        let password = (form.elements["password"] as HTMLInputElement).value;
        if (this._creatingAccount) {
            signUp(username, password)
                    .then((resp) => {
                if (notification) notification.save("Account created!");
                    })
                    .catch((error) => {
                if (notification) notification.error(error.message);
            });
            this._creatingAccount = false;
        } else {
            signIn(username, password).catch((error) => {
                if (notification) notification.error("Username or password is incorrect");
            });
        }
        this._onLoginCancel();
    } else if (this._resetingPassword && formElementsComplete(form, ["username"])) {
        let username = (form.elements["username"] as HTMLInputElement).value;
        resetPassword(username)
                .then((resp) => {
            if (notification) notification.save("Email send");
            this._resetingPassword = false;
                })
                .catch((error) => {
            if (notification) notification.error(error.message);
            this._resetingPassword = false;
        });
    }
  }

  _toggleDrawer() {
    this._drawerOpened = !this._drawerOpened;
    var left = this.shadowRoot!.getElementById("left");
    left!.className = "left" + (this._drawerOpened ? " open" : "");
  }

  protected firstUpdated() {
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    store.dispatch(fetchUser());
    store.dispatch(modelsGet());
    store.dispatch(versionsGet());
    store.dispatch(modelConfigurationsGet());
    store.dispatch(modelConfigurationSetupsGet());
    store.dispatch(regionsGet());
    store.dispatch(imagesGet());
    store.dispatch(processesGet());
  }

  protected updated(changedProps: PropertyValues) {
    if (changedProps.has('_page')) {
      const pageTitle = this.appTitle + ' - ' + this._page;
      updateMetadata({
        title: pageTitle,
        description: pageTitle
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  stateChanged(state: RootState) {
    this._page = state.app!.page;
    this._subpage = state.app!.subpage;
    if (state.explorerUI) {
        if (state.explorerUI.selectedModel != this._selectedModel) this._selectedModel = state.explorerUI.selectedModel;
        if (state.explorerUI.selectedVersion != this._selectedVersion) this._selectedVersion = state.explorerUI.selectedVersion;
        if (state.explorerUI.selectedConfig != this._selectedConfig) this._selectedConfig = state.explorerUI.selectedConfig;
        if (state.explorerUI.selectedCalibration != this._selectedSetup) this._selectedSetup = state.explorerUI.selectedCalibration;
        if (this._selectedModel) {
            let db = state.modelCatalog;
            if (db && db.models[this._selectedModel]) {
                this._model = db.models[this._selectedModel];
            }
        } else {
            this._model = undefined;
        }
    }
    this.user = state.app!.user!;
  }
}
