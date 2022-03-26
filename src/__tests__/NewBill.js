/**
 * @jest-environment jsdom
 */

import { screen, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js"
import store from "../app/Store.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import storeMock from "../__mocks__/store.js"
import fs from "fs"
import { ROUTES } from "../constants/routes"
import {bills} from "../fixtures/bills"





describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
         email: 'employee@test.tld',
         type: 'employee'
       }))

  describe("And I submit a valid bill form", () => {
    test('then a bill is created', () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const onNavigate = jest.fn()
       router()
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store:storeMock, localStorage:localStorageMock })
      const formBill = screen.getByTestId('form-new-bill')
      document.querySelector(`input[data-testid="expense-name"]`).value = "Note test 1"
      document.querySelector(`input[data-testid="datepicker"]`).value = "2022-02-02"
      document.querySelector(`select[data-testid="expense-type"]`).value = "Restaurants et bars"
      document.querySelector(`input[data-testid="amount"]`).value = 100
      document.querySelector(`input[data-testid="vat"]`).value = 10
      document.querySelector(`input[data-testid="pct"]`).value = 20
      document.querySelector(`textarea[data-testid="commentary"]`).value = "Ceci est un test"
      newBill.fileUrl = './LogoOC.png'
      newBill.fileName = 'LogoOC.png'
      fireEvent.submit(formBill)
      expect(onNavigate).toHaveBeenCalled()
    })
  })

  describe("When I am on NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
    test("Then a form with nine fields should be rendered", () => {
      document.body.innerHTML = NewBillUI()
      const form = document.querySelector("form")
      expect(form.length).toEqual(9)
    })

    describe("When I upload a file", () => {
      test ("It is a correct png file, the pop up shouldn't be open", async () => {
        const response = fs.readFileSync(__dirname+'/LogoOC.png')
        const alertMock = jest.fn()
        Object.defineProperty(window, 'alert', { value: alertMock })
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        const onNavigate = (pathname) => {window.onNavigate(pathname)}
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store:storeMock, localStorage:localStorageMock })
        newBill.handleChangeFile = jest.fn()
        const inputFile = screen.getByTestId("file")
        //console.log(inputFile)
       const fileTest = new File([response], 'logo.png', {
        type: "image/png",
      })
        fireEvent.change(inputFile, {
            target: {files:[fileTest]}
        })
        await new Promise((r) => setTimeout(r, 2000));
        expect(alertMock).not.toHaveBeenCalled()
      })

      test ("It is a correct jpg file, the pop up shouldn't be open", async () => {
        const response = fs.readFileSync(__dirname+'/logojpg.jpeg')
        const alertMock = jest.fn()
        Object.defineProperty(window, 'alert', { value: alertMock })
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        const onNavigate = (pathname) => {window.onNavigate(pathname)}
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store:storeMock, localStorage:localStorageMock })
        newBill.handleChangeFile = jest.fn()
        const inputFile = screen.getByTestId("file")
       const fileTest = new File([response], 'logo.jpeg', {
        type: "image/jpg",
      })
        fireEvent.change(inputFile, {
            target: {files:[fileTest]}
        })
        await new Promise((r) => setTimeout(r, 2000));
        expect(alertMock).not.toHaveBeenCalled()
      })
      test ("It is a uncorrect txt file, the pop up should be open", async () => {
        const response = fs.readFileSync(__dirname+'/FileTest.txt')
        //console.log(...response)
        const alertMock = jest.fn((message)=> console.log(message))
        Object.defineProperty(window, 'alert', { value: alertMock })
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        const onNavigate = (pathname) => {window.onNavigate(pathname)}
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store:storeMock, localStorage:localStorageMock })
        newBill.handleChangeFile = jest.fn()
        const inputFile = screen.getByTestId("file")
       const fileTest = new File([response], 'test.txt', {
        type: "text/plain",
      })
        fireEvent.change(inputFile, {
            target: {files:[fileTest]}
        })
        await new Promise((r) => setTimeout(r, 2000));
        expect(alertMock).toHaveBeenCalled()
      })
     })


    describe ("And I use a wrong file", () => {
      test('loadMimeType function return false', () => {
        const wrongMimeType = 'EFBBBF'
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)        
         const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store, localStorage:localStorageMock })
        const wrongMimeTypeResult = newBill.loadMimeType(wrongMimeType)
        expect(wrongMimeTypeResult).toBeFalsy()
      })
    })

    describe ("And I use a correct jpg file", () => {
      test('loadMimeType function return true', () => {
        const correctMimeType = 'ffd8ffe1'
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store, localStorage:localStorageMock })
        const correctMimeTypeResult = newBill.loadMimeType(correctMimeType)
        expect(correctMimeTypeResult).toBeTruthy()
      })
    })


    describe ("And I use a correct png file", () => {
      test('loadMimeType function return true', () => {
        const correctMimeType = '89504e47'
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, store, localStorage:localStorageMock })
        const correctMimeTypeResult = newBill.loadMimeType(correctMimeType)
        expect(correctMimeTypeResult).toBeTruthy()
      })
    })


  })

  //test intégration POST
  describe("When we try to use API", () => {
    beforeEach(() => {
      jest.spyOn(storeMock, "bills")
      storeMock.bills.mockImplementationOnce(() => {
        return {
          update : (bill) =>  {
            if (bill.data && bill.selector){
              return Promise.resolve(bills[0])
            } else {
            return Promise.reject(new Error("Erreur 400"))
          }
        }
        }})
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("API return correct bill", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}
      const newBill = new NewBill({ document, onNavigate, store:storeMock, localStorage:localStorageMock })
      newBill.billId = "aaaaa"
      const formBill = screen.getByTestId('form-new-bill')
      //remplir formulaire
      document.querySelector(`input[data-testid="expense-name"]`).value = "Note test 1"
      document.querySelector(`input[data-testid="datepicker"]`).value = "2022-02-02"
      document.querySelector(`select[data-testid="expense-type"]`).value = "Restaurants et bars"
      document.querySelector(`input[data-testid="amount"]`).value = 100
      document.querySelector(`input[data-testid="vat"]`).value = 10
      document.querySelector(`input[data-testid="pct"]`).value = 20
      document.querySelector(`textarea[data-testid="commentary"]`).value = "Ceci est un test"
      newBill.fileUrl = './LogoOC.png'
      newBill.fileName = 'LogoOC.png'
      fireEvent.submit(formBill)
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy()
    })
    test("an error occurs on API and fails with 400 message error", async () => {
      const consoleErrorMock = jest.fn()
      Object.defineProperty(console, 'error', {value:consoleErrorMock})
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {document.body.innerHTML = ROUTES({pathname})}
      const newBill = new NewBill({ document, onNavigate, store:storeMock, localStorage:localStorageMock })
      const formBill = screen.getByTestId('form-new-bill')
      fireEvent.submit(formBill)
      await new Promise((r) => setTimeout(r, 2000));
      expect(consoleErrorMock).toHaveBeenCalled()
    })

})

})