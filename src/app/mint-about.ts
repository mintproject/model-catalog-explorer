/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html, customElement } from 'lit-element';
import { PageViewElement } from '../components/page-view-element';

// These are the shared styles needed by this element.
import { SharedStyles } from '../styles/shared-styles';

@customElement('mint-about')
export class MintAbout extends PageViewElement {
  static get styles() {
    return [
      SharedStyles
    ];
  }

  protected render() {
    return html`
      <section>
      The  Model Explorer is an application for finding and exploring software models and metadata available in the MINT Model Catalog without having to interact with the APIs or clients designed for developers.

Users can search for existing software models by typing their names, or sorting them out by category (e.g., Agriculture, Climate, etc.).

[show picture]

Once a model is selected, the application will show its available versions and software configurations so users can explore their corresponding inputs and outputs.

See an example here [ADD LINK].

If several software configurations are available for a particular model version, the application will display them side by side to enable comparison.

The Model Explorer is maintained in a GitHub repository [ADD LINK], and it is currently optimized for the Chrome browser.

Contributors: Hernan Vargas, Daniel Garijo, Deborah Khider and Yolanda Gil
        <h2>Oops! You hit a 404</h2>
        <p>
          The page you're looking for doesn't seem to exist. Head back
          <a href="/">home</a> and try again?
        </p>
      </section>
    `
  }
}
