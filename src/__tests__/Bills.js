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
import { type } from "express/lib/response";

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
        document.body.innerHTML = BillsUI({ data: bills })
        const btnNewBill = screen.getByTestId("btn-new-bill") //le bouton
        const billsInit = new Bills({document, onNavigate, store, localStorage})
        const handleClickNewBillVar = jest.fn(() => billsInit.handleClickNewBill ())
        btnNewBill.addEventListener("click", handleClickNewBillVar)
        userEvent.click(btnNewBill)
        expect(handleClickNewBillVar).toHaveBeenCalled()
      })
    }) 

    describe ('when i click on iconEye', () => {
      test ('Then it should open the image of bill', () => {

      })
    })
    
  })
})
