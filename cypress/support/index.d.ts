/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Substitute for "visit" command. The original visit command should not be used, when the tests depend on the
     * scroll, because cypress has an issue with "scroll-behaviour: smooth
     *
     * See https://github.com/cypress-io/cypress/issues/3200#issuecomment-672788861
     *
     * @example cy.visitApp('/about')
     */
    visitApp(url: string): Chainable<Element>
  }
}
