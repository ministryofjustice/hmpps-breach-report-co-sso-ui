context('Basic Details page', () => {
  it('can see readonly fields', () => {
    cy.visit('/basic-details/00000000-0000-0000-0000-000000000001')
    cy.get('#page-title').should('contain.text', 'COSSO - Basic Details')
    cy.get('#id').should('contain.text', '00000000-0000-0000-0000-000000000001')
  })

  it('can see buttons', () => {
    cy.visit('/basic-details/00000000-0000-0000-0000-000000000001')
    cy.get('#continue-button').should('contain.text', 'Continue')
    cy.get('#close-button').should('contain.text', 'Save Progress and Close')
    cy.get('#refresh-from-ndelius--button').should('contain.text', 'Refresh from Delius')
  })
})
