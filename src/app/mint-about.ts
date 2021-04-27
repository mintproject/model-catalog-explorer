/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { css, html, customElement } from 'lit-element';
import { PageViewElement } from '../components/page-view-element';

// These are the shared styles needed by this element.
import { SharedStyles } from '../styles/shared-styles';

@customElement('mint-about')
export class MintAbout extends PageViewElement {
  static get styles() {
    return [ SharedStyles,
        css`
        #about {
            margin: 0 auto;
            max-width: 800px;
        }

        #about > img {
            width: 700px;
            display: block;
            margin:auto;
            border: 1px solid black;
            margin-bottom: 1em;
        }

        p {
            text-align:justify;
        }
        `
    ];
  }

  protected render() {
    return html`
        <section>
            <div id="about">
                <br/>
                <wl-title level="1"> About </wl-title>
                <wl-divider></wl-divider>
                <br/>
                <p>
                    The WIFIRE Model Commons supports the discovery and exploration of fire models based on simulation needs.
                    It uses AI reasoners to recommend appropriate models to users based on model characteristics and metadata.
                    The WIFIRE Model Commons can be accessed through a user interface or through APIs and clients designed for
                    application developers.
                </p> 

                <p>
                    Once a model is selected, several versions and configurations may be available that are customized for
                    different scenarios. 
                </p>

                <p>
                    The WIFIRE Model Commons was originally developed as part of the 
                    <a href="http://mint-project.info/" target="_blank">MINT modeling framework</a>.
                    The software is open source and is maintained in a 
                    <a href="https://github.com/mintproject/model-catalog-explorer" target="_blank">GitHub repository</a>.
                    The user interface is currently optimized for the Chrome browser.
                </p>

                <p>
                    <a href="http://mint-project.info/" target="_blank">
                        Powered by MINT
                    </a>.
                    Contact us at <a href="mailto:mint-project@googlegroups.com">mint-project@googlegroups.com</a>
                </p>
            </div>
      </section>
    `
  }
}
