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
                    in the MINT Model Catalog without having to interact with the APIs or clients designed for developers.
                </p> 
                <p>
                    Users can search for existing software models by typing their names, categories or keywords.
                </p>
                <p>
                    Once a model is selected, the application will show its available versions and software configurations
                    so users can explore their corresponding inputs and outputs.
                </p>
                <img src="/images/example.gif"></img>
                <p>
                    See an example here: <a href="/models/explore/PIHM">Penn State Integrated Hydrology Model</a>
                </p> 
                <p>
                    If several software configurations are available for a particular model version, the application will 
                    display them side by side to enable comparison.
                </p>
                <p> 
                    The Model Explorer is maintained in a 
                    <a href="https://github.com/mintproject/mint-ui-lit" target="_blank">GitHub repository</a>,
                    and it is currently optimized for the Chrome browser.
                </p>

                <br/>
                <p>
                    The development of the MINT Model Explorer was led by Daniel Garijo, and implemented by Hernán
                    Vargas, Varun Ratnakar, Dhruv Pattel, Shreyas Kolpe, Rohit Mayura and Yash Dholakia.
                    Other contributors include Deborah Khider, Yolanda Gil, Scott Peckham, Chris Duffy, Kelly Cobourn,
                    Suzanne Pierce, Zeya Zhang, Lele Shu and Mary Hill.
                </p>
            </div>
            <p style="text-align: right; padding: 15px 10px; font-style: oblique;">
                For corrections or additions to the information in the MINT Model Explorer,
                please contact us at <a href="mailto:mint-project@googlegroups.com">mint-project@googlegroups.com</a>
            </p>
      </section>
    `
  }
}
