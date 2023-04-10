/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js"
import { fireEvent } from "@testing-library/dom"

describe("Given I am connected as an employee", () => {
  describe('When I am on NewBill Page', () => {
    // test 1
    // permet de verifier l'affochage de la page newBill
    test('I should see a title name ( Envoyer une note de frais) ', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'e@e' })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
    // test 2
    // permet de vérifier que les images soient au bon format
    test(' Then on image upload checkExtension should return true if file passed is boby.png', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      const checkExtension = jest.fn(newBill.checkExtension)
      const fileName = 'boby.png'
      expect(checkExtension(fileName)).toBeTruthy()
    })
  })

  // test 3 
  //vérification de l'upload des fichiers 
  describe('When I am on NewBill Page and I upload a file', async () => {
    jest.spyOn(mockStore, 'bills')

    localStorage.setItem(
      'user',
      JSON.stringify({ type: 'Employee', email: 'e@e' })
    )
    const root = document.createElement('div')
    root.setAttribute('id', 'root')
    document.body.append(root)
    router()
    window.onNavigate(ROUTES_PATH.NewBill)
    await waitFor(() => screen.getAllByTestId('form-new-bill'))
    const file = new File(['chucknorris'], 'chucknorris.png', {
      type: 'image/png',
    })
    const input = screen.getByTestId('file')
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    input.dispatchEvent(new Event('change'))

    test('It should upload a file and create a bill ', async () => {
      // expect()
      await new Promise(process.nextTick)
      expect(mockStore.bills().create).toHaveBeenCalled()
    })
  })

  // test 4 
  // création de la facture
  describe('When I am on NewBill Page and I submit a new bill', () => {
    test('Then It should create a bill', async () => {
      const html = NewBillUI()
  
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
