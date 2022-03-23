/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import store from "../app/Store.js"
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"
//import $ from "jquery"
//jest.mock('jquery')

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      //on s'attend à ce que la div contenant l'icône (data-testid='icon-window') ait pour classe 'active-icon'
      expect(windowIcon.className).toEqual('active-icon')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe('when I click on the New Bill button', () => {
      //la page nouvelle note de frais s'ouvre
      test("Then it should open new bill page",  () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const onNavigate = (pathname) => {window.onNavigate(pathname)}
      const billsInit = new Bills({document, onNavigate, store, localStorage})
      billsInit.handleClickNewBill = jest.fn()
      const btnNewBill = screen.getByTestId("btn-new-bill") //le bouton 
      btnNewBill.addEventListener('click', billsInit.handleClickNewBill)
      btnNewBill.click()
      const formBill = screen.getByTestId("form-new-bill")
      expect(billsInit.handleClickNewBill).toHaveBeenCalled()
      expect(formBill).toBeTruthy()
      })
    }) 

    describe ('when i click on iconEye', () => {
      test ('Then it should open a modal', () => {
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        const onNavigate = (pathname) => {window.onNavigate(pathname)}
        document.body.innerHTML = BillsUI({ data: bills })
        const mockModal = jest.fn()
        const $ = () => {return {
          width:jest.fn(), 
          find:jest.fn(() => {
            return {html:jest.fn()}
          }), 
          modal:mockModal, 
          click:jest.fn()}}
        window.$=$
        const billsInit = new Bills({document, onNavigate, store, localStorageMock})
        const mockfunction = jest.fn(billsInit.handleClickIconEye.bind($))
        const handleClick = (e) => {mockfunction(e.target)}
        const eyeIcon = screen.getAllByTestId("icon-eye")[0] //l'icone eye
        eyeIcon.addEventListener('click', handleClick)
        userEvent.click(eyeIcon)
        const modalFile = document.getElementById("modaleFile")
        expect(mockModal).toBeCalled()
      })
      test("Then the modal should display the attached image", () => {
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        const onNavigate = (pathname) => {window.onNavigate(pathname)}
        document.body.innerHTML = BillsUI({ data: bills })
        const billsInit = new Bills({ document, onNavigate, firestore: null, localStorage: window.localStorage })
        const iconEye = document.querySelector('div[data-testid="icon-eye"]')
        billsInit.handleClickIconEye(iconEye)
        expect(document.querySelector(".modal")).toBeTruthy()
      })
    })
      /////////////////////////////
      // test d'intégration GET //
      ////////////////////////////
    describe("Given I am a user connected as Employee", () => {
      describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
          localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.append(root)
          router()
          window.onNavigate(ROUTES_PATH.Bills)
          await waitFor(() => screen.getByText("Mes notes de frais"))
          const contentTitle  = screen.getByText("Mes notes de frais")
          expect(contentTitle).toBeTruthy()
        })
        describe("When an error occurs on API", () => {
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.appendChild(root)
          router()
          //})
          test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills = jest.fn()
            mockStore.bills(() => {
              return Promise.reject(new Error("Erreur 404"))
            })
            const html = BillsUI({ error: "Erreur 404" })
            document.body.innerHTML = html
            window.onNavigate(ROUTES_PATH.Bills)
            const message = screen.getByText("Erreur 404")
            expect(message).toBeTruthy()
          })

          test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list : () =>  {
                  return Promise.reject(new Error("Erreur 500"))
                }
              }})
              const html = BillsUI({ error: "Erreur 500" })
              document.body.innerHTML = html
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText("Erreur 500")
            expect(message).toBeTruthy()
          })
        })
      })
    })
  })
})
