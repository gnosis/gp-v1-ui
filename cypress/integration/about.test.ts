describe('About', () => {
  it('Navigates from link in the footer', () => {
    // GIVEN: home page
    cy.visit('/')

    // WHEN: Click on the "About" link in the footer
    cy.get('footer').contains('About').click()

    // THEN: We navigate to the about page
    cy.url().should('contain', '/about')
  })

  it('Navigates using URL', () => {
    // GIVEN: about page
    cy.visit('/about')

    // WHEN: -
    // THEN: There's the heading we expect
    cy.get('main h1:first').contains('About Gnosis Protocol Web')
  })
})
