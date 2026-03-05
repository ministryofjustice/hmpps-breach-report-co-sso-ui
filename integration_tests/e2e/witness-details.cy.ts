context('Failures and Enforcement page', () => {
  it('page loads with stored data in fields', () => {
    cy.visit('/witness-details/22b2660c-8b2b-41fc-8ff4-88ec47423e26')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#name').should('contain.text', 'Jeff the Chef')
    cy.get('#probation-area').should('contain.text', 'The Cooking Show Area')
    cy.get('#address').should('contain.text', 'Newer Postal Address')
    cy.get('#address').should('contain.text', '2 Newer Postal Street')
    cy.get('#address').should('contain.text', 'Newer Postal District')
    cy.get('#address').should('contain.text', 'Newer Postal City')
    cy.get('#address').should('contain.text', 'Newer Postal County')
    cy.get('#address').should('contain.text', 'PO20 2ST')
    cy.get('#phone-number').should('contain.text', '01234567891')
    cy.get('#email-address').should('contain.text', 'MrJeffTheChef@email.com')
    cy.get('#witnessAvailability-hint .govuk-details__text').should('contain.text', 'Witness Availability Help Text')
    cy.get('#witnessAvailability').should('contain.text', 'Some availability for my witness')
  })

  it('can see buttons', () => {
    cy.visit('/witness-details/22b2660c-8b2b-41fc-8ff4-88ec47423e26')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#continue-button').should('contain.text', 'Continue')
    cy.get('#close-button').should('contain.text', 'Save Progress and Close')
  })

  it('can see alternate address dropdown conditionally', () => {
    cy.visit('/witness-details/22b2660c-8b2b-41fc-8ff4-88ec47423e26')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('input[name="offenderAddressSelectOne"][value="Yes"]').should('be.checked')
    cy.get('#alternate-address').should('exist')
    cy.get('#alternate-address').should('not.be.visible')
    cy.get('input[name="offenderAddressSelectOne"][value="No"]').click()
    cy.get('#alternate-address').should('be.visible')
    cy.get('label[for="alternate-address"]').should('contain.text', 'Please pick an alternative work location')
  })

  it('will save all fields and redirect properly when Save is clicked', () => {
    cy.intercept('POST', '/witness-details/**').as('formSubmit')
    cy.visit('/witness-details/8465e5d8-9417-4ff1-9738-bcb047be3c38')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/offence-details/8465e5d8-9417-4ff1-9738-bcb047be3c38')
  })

  it('will save all fields and redirect properly when Save is clicked when new address is selected', () => {
    cy.intercept('POST', '/witness-details/**').as('formSubmit')
    cy.visit('/witness-details/ff0dc548-b881-4da5-875f-86f6ca676b64')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('input[name="offenderAddressSelectOne"][value="No"]').click()
    cy.get('#alternate-address').should('be.visible')
    cy.get('#alternate-address').select('4')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/offence-details/ff0dc548-b881-4da5-875f-86f6ca676b64')
  })

  it('close button saves information and displays message', () => {
    cy.intercept('POST', '/witness-details/**').as('saveAndCloseRequest')
    cy.visit('/witness-details/683da152-0c88-4340-ad18-169a435b70f4')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#close-button').click()
    cy.wait('@saveAndCloseRequest').then(({ request }) => {
      const body = new URLSearchParams(request.body)
      expect(body.get('action')).to.equal('saveProgressAndClose')
    })
    cy.contains('You can now safely close this window').should('be.visible')
    cy.get('#page-title').should('not.exist')
  })

  it('should return to check your report if came from check your report', () => {
    cy.intercept('POST', '/witness-details/**').as('formSubmit')
    cy.visit('/witness-details/107c8aa7-acd9-46c7-8dbb-e1c3b5d7fd1c?returnTo=check-your-report')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#continue-button').click()
    cy.wait('@formSubmit')
    cy.url().should('include', '/check-your-report/107c8aa7-acd9-46c7-8dbb-e1c3b5d7fd1c')
  })

  it('correct validation should show on max character fields', () => {
    cy.visit('/witness-details/7b75e1c7-2288-4ab6-afdc-727be2898f6c')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#witnessAvailability').clear()
    cy.get('#witnessAvailability').invoke('val', 'X'.repeat(20001)).trigger('input')
    cy.get('#continue-button').click()
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.get('#witnessAvailability-error')
      .should('exist')
      .should('contain.text', 'Witness Availability: This field must be 20000 characters or less')
  })

  it('should auto populate address if default returned from integrations', () => {
    cy.visit('/witness-details/bff008a7-80a9-4c74-ab80-4d15f3c68532')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#address').should('contain.text', 'Default Address')
    cy.get('#address').should('contain.text', '3 Default Street')
    cy.get('#address').should('contain.text', 'Default District')
    cy.get('#address').should('contain.text', 'Default Town')
    cy.get('#address').should('contain.text', 'Default County')
    cy.get('#address').should('contain.text', 'DE7 4LT')
  })

  it('should display message when current saved address is no longer available', () => {
    cy.visit('/witness-details/532b684a-e0d6-4694-b445-e2e1c01b4517')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.get('#old-address-endDated').should('exist').should('be.visible')
    cy.get('#old-address-endDated').should(
      'contain.text',
      'Work Location and address: The previously selected address is no longer available. Please select an alternative',
    )
  })

  it('add address button should navigate to add address', () => {
    cy.visit('/witness-details/2e6d8c12-a090-4509-9e39-ac1844ed1062')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#AddAddressMessage').should('exist').should('be.visible')
    cy.get('#AddAddressMessage').should(
      'contain.text',
      'No reply address can be found for this responsible officer. Please add an address by selecting the button below.',
    )
    cy.get('#add-address-button').should('exist').should('be.visible')
    cy.get('#add-address-button').click()
    cy.url().should('include', '/add-address/2e6d8c12-a090-4509-9e39-ac1844ed1062')
  })

  it('update address button should navigate to add address', () => {
    cy.visit('/witness-details/396393bc-de1f-488b-9d03-63d0381382ba')
    cy.url().should('include', '/witness-details')
    cy.get('#page-title').should('contain.text', 'Breach Report CO SSO – RO and Witness Details')
    cy.get('#address').should('contain.text', '32 Manual Street')
    cy.get('#update-address-button').should('exist').should('be.visible')
    cy.get('#update-address-button').click()
    cy.url().should('include', '/add-address/396393bc-de1f-488b-9d03-63d0381382ba')
  })

  it('should stay on page and show NDelius error message if 500 thrown from NDelius integration service', () => {
    cy.visit('/witness-details/9c9a1ad2-7141-4b03-837f-b66346a0b6ac')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains('There has been a problem fetching information from NDelius. Please try again later.').should('exist')
  })

  it('should stay on page and show COSSO Service error message if 500 thrown from COSSO Service', () => {
    cy.visit('/witness-details/428d2aa3-b184-4484-b665-8d8e02dd92d8')
    cy.get('.govuk-error-summary__title').should('exist').should('contain.text', 'There is a problem')
    cy.contains(
      'There has been a problem fetching information from the Breach Report CO SSO Service. Please try again later.',
    ).should('exist')
  })
})
