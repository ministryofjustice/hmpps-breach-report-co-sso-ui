context('Basic Details page', () => {
  it('can see readonly fields', () => {
    cy.visit('/basic-details/00000000-0000-0000-0000-000000000001')
    cy.url().should('include', '/basic-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Basic Details')
    cy.get('#crn').should('contain.text', 'X012345')
    cy.get('#name').should('contain.text', 'Mr Billy The Kid')
    cy.get('#date-of-birth').should('contain.text', '17/03/1980')
    cy.get('#phone-number').should('contain.text', '01234 567890')
    cy.get('#mobile-number').should('contain.text', '07123 456789')
    cy.get('#email-address').should('contain.text', 'test@email.com')
    cy.get('#address').should('contain.text', 'Newer Postal Address')
  })

  it('can see buttons', () => {
    cy.visit('/basic-details/00000000-0000-0000-0000-000000000001')
    cy.url().should('include', '/basic-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Basic Details')
    cy.get('#continue-button').should('contain.text', 'Continue')
    cy.get('#close-button').should('contain.text', 'Save Progress and Close')
    cy.get('#refresh-from-ndelius--button').should('contain.text', 'Refresh from Delius')
  })

  it('refresh button performs a post request then reloads the screen', () => {
    cy.intercept('POST', '/basic-details/**').as('refreshRequest')
    cy.visit('/basic-details/00000000-0000-0000-0000-000000000001')
    cy.get('#name').should('contain.text', 'Mr Billy The Kid')
    cy.get('#refresh-from-ndelius--button').click()
    cy.wait('@refreshRequest')
    cy.url().should('include', '/basic-details/00000000-0000-0000-0000-000000000001')
    cy.url().should('include', '/basic-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Basic Details')
    cy.get('#name').should('contain.text', 'Mr Billy The Kid')
    cy.get('#crn').should('contain.text', 'X012345')
  })

  it('close button performs a post request and displays message', () => {
    cy.intercept('POST', '/basic-details/**').as('saveAndCloseRequest')
    cy.visit('/basic-details/00000000-0000-0000-0000-000000000001')
    cy.get('#close-button').click()
    cy.wait('@saveAndCloseRequest').then(({ request }) => {
      const body = new URLSearchParams(request.body)
      expect(body.get('action')).to.equal('saveProgressAndClose')
    })
    cy.contains('You can now safely close this window').should('be.visible')
    cy.get('#page-title').should('not.exist')
  })

  it('continue button performs a post and redirects to witness details page', () => {
    cy.intercept('POST', '/basic-details/**').as('formSubmit')
    cy.visit('/basic-details/00000000-0000-0000-0000-000000000001')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/witness-details/00000000-0000-0000-0000-000000000001')
  })

  it('should display deeplink when no valid addresses present', () => {
    cy.visit('/basic-details/ace6f3ef-e677-45b7-8570-52c7593a8987')
    cy.url().should('include', '/basic-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO - Basic Details')
    cy.get('#address').should('not.exist')
    cy.get('#no-address-found').should('exist').should('contain.text', 'No Postal Address found in National Delius')
    cy.get('#add-address--deeplink')
      .should('exist')
      .should('contain.text', 'Click this hyperlink to open a new tab to add an address to Delius')
    cy.get('#add-address--deeplink').should('have.attr', 'href').and('include', 'component=AddressandAccommodation')
  })

  it('should stay on page and show NDelius error message if 500 thrown from NDelius integration service', () => {
    cy.visit('/basic-details/67006838-34e7-41b8-8ea9-5bec66106041')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains('There has been a problem fetching information from NDelius. Please try again later.').should('exist')
  })

  it('should stay on page and show COSSO Service error message if 500 thrown from COSSO Service', () => {
    cy.visit('/basic-details/d6cbd844-28e9-4fcb-82db-f50bd335b7f9')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains(
      'There has been a problem fetching information from the Breach Report CO SSO Service. Please try again later.',
    ).should('exist')
  })

  it('should show error page with message if 400 error returned from integrations crn not existing', () => {
    cy.visit('/basic-details/d378bbc3-7032-4a4d-9cba-94eb49fef1bc')
    cy.url().should('include', '/basic-details')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains(
      'An unexpected 400 type error has occurred. Please contact the service desk and report this error.',
    ).should('exist')
  })
})
