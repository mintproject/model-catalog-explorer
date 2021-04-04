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
                    The  Model Explorer is an application for finding and exploring software models and metadata available
                    in the WIFIRE Model Catalog without having to interact with the APIs or clients designed for developers.
                </p> 
                <p>
                    Users can search for existing software models by typing their names, categories or keywords.
                </p>
                <p>
                    Once a model is selected, the application will show its available versions and software configurations
                    so users can explore their corresponding inputs and outputs 
                    (e.g. <a href="/models/explore/quic_fire">QUIC-Fire Model</a>).
                </p>

                <p> 
                    The Model Explorer is maintained in a 
                    <a href="https://github.com/mintproject/model-catalog-explorer" target="_blank">GitHub repository</a>,
                    and it is currently optimized for the Chrome browser.
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
