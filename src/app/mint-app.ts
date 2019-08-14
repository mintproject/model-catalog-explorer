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
import { explorerClearModel } from '../screens/models/model-explore/ui-actions';

// This element is connected to the Redux store.
import { store, RootState } from './store';

// These are the actions needed by this element.
import {
  navigate, fetchUser, signIn, goToPage,
} from './actions';

import '../screens/modeling/modeling-home';
import '../screens/models/model-explore/model-explore';
import './mint-about';

import { SharedStyles } from '../styles/shared-styles';
import { showDialog, hideDialog, formElementsComplete } from '../util/ui_functions';

@customElement('mint-app')
export class MintApp extends connect(store)(LitElement) {
  @property({type: String})
  appTitle = '';

  @property({type: String})
  private _page = '';

  @property({type: String})
  private _selectedModel = '';

  @property({type:Boolean})
  private _drawerOpened = false;

  @property({type:Boolean})
  private _infoActive = true;

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
        background: #F6F6F6;
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

      .card {
        height: calc(100% - 100px);
        overflow: auto;
      }
      
      .breadcrumbs {
        margin-left: 0px;
      }

      .breadcrumbs li.active {
        background-color: #629b30;
        color: white;
      }
      .breadcrumbs li.active:before {
        border-color: #629b30;
        border-left-color: transparent;
      }
      .breadcrumbs li.active:after {
        border-left-color: #629b30;
      }

      .breadcrumbs li:first {
        background-color: #629b30;
        color: white;
      }
      .breadcrumbs li:first:before {
        border-color: #629b30;
        border-left-color: transparent;
      }
      .breadcrumbs li:first:after {
        border-left-color: #629b30;
      }

      #info {
        margin: 0 auto;
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
      `
    ];
  }

  protected render() {
    // Anything that's related to rendering should be done in here.
    return html`
      <!-- Overall app layout -->

    <div class="appframe">
      <!-- Navigation Bar -->
      <wl-nav>
        <div slot="title">
        
            <ul class="breadcrumbs">
              <li @click="${()=>goToPage('home')}"
                  class=${(this._page == 'home' ? 'active' : '')}>
                  <div style="vertical-align:middle">
                    ▶
                    Model catalog
                  </div>
              </li>
              ${this._selectedModel? html`<li class="active">${this._selectedModel.split('/').pop()}</li>` : html``}
            </ul>

        </div>
        <div slot="right">
          <a class="title" href="/about" @click="${()=>{
            store.dispatch(explorerClearModel());
              }}"><img height="40" src="/images/logo.png"></a>
        </div>
      </wl-nav>

        <div class="sectionframe">

          <div id="right">
            <div class="card">
              <!-- Main Pages -->
              <mint-about class="page fullpage" ?active="${this._page == 'about'}"></mint-about>
              ${(this._page == 'home' && this._infoActive) ? html`
              <div id="info">
                <div> <wl-icon @click="${()=>{this._infoActive = false;}}">clear<wl-icon> </div>
                <div class="cont"> 
                    <p>The <b>MINT Model Catalog Explorer</b> is an application for finding and exploring software models 
                    and metadata available in the MINT Model Catalog.</p>
                    <p>We are currently adding new models and metadata, so this is work in progress.
                        Click <a href="/about">here</a> to know more.
                    </p>
                    <br/>
                    <p>We <b>recommend using the Model Explorer in Chrome.</b></p>
                </div>
              </div>
              ` : html``}
              <model-explorer class="page fullpage" ?active="${this._page != 'about'}"></model-explorer>
            </div>
          </div>
        </div>
    </div>

    ${this._renderDialogs()}
    `;
  }

  _renderDialogs() {
    return html`
    <wl-dialog id="loginDialog" fixed backdrop blockscrolling>
      <h3 slot="header">Please enter your username and password for MINT</h3>
      <div slot="content">
        <p></p>      
        <form id="loginForm">
          <div class="input_full">
            <label>Username</label>
            <input name="username" type="text"></input>
          </div>
          <p></p>
          <div class="input_full">
            <label>Password</label>
            <input name="password" type="password"></input>
          </div>

        </form>
      </div>
      <div slot="footer">
          <wl-button @click="${this._onLoginCancel}" inverted flat>Cancel</wl-button>
          <wl-button @click="${this._onLogin}" class="submit" id="dialog-submit-button">Submit</wl-button>
      </div>
    </wl-dialog>
    `;
}

  _showLoginWindow() {
    showDialog("loginDialog", this.shadowRoot!);
  }

  _onLoginCancel() {
    hideDialog("loginDialog", this.shadowRoot!);
  }

  _onLogin() {
    let form:HTMLFormElement = this.shadowRoot!.querySelector<HTMLFormElement>("#loginForm")!;
    if(formElementsComplete(form, ["username", "password"])) {
        let username = (form.elements["username"] as HTMLInputElement).value;
        let password = (form.elements["password"] as HTMLInputElement).value;
        signIn(username, password);
        this._onLoginCancel();
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
    if (state.explorerUI && state.explorerUI.selectedModel != this._selectedModel) {
        this._selectedModel = state.explorerUI.selectedModel;
    }
  }
}
