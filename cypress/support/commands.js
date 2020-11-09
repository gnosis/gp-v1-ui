/**
 * Substitute for "visit" command. The original visit command should not be used, when the tests depend on the
 * scroll, because cypress has an issue with "scroll-behaviour: smooth"
 *
 * See https://github.com/cypress-io/cypress/issues/3200#issuecomment-672788861
 *
 * @example cy.visitApp('/about')
 */
Cypress.Commands.add('visitApp', (url) => {
  cy.visit(url)
  cy.document().then((document) => {
    const node = document.createElement('style')
    node.innerHTML = 'html { scroll-behavior: inherit !important; }'
    document.body.appendChild(node)
  })
})
