describe('About', () => {
  beforeEach(() => {
    cy.visit('/about')
  })
  it('Does not do much!', () => {
    expect(true).to.equal(true)
  })
})
