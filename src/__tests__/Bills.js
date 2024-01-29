/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom';
import { getByTestId } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);


const billContainer = new Bills({
  document,
  onNavigate: jest.fn(),
  store: mockStore,
  localStorage: window.localStorage,

})

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(() => {
      document.body.innerHTML = BillsUI({ data: bills })

    })

    afterEach(() => {
      document.body.innerHTML = ""

    })
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
      const hasActiveIconClass = windowIcon.classList.contains('active-icon')
      expect(hasActiveIconClass).toBe(true);

    })
    test("Then bills should be ordered from earliest to latest", () => {
      const _bills = bills.sort((a, b) => ((new Date(a.date) < new Date(b.date)) ? 1 : -1))
      document.body.innerHTML = BillsUI({ data: _bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((new Date(a) < new Date(b)) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)

    })
    test("Then clicking on an eye icon will open a modal", () => {
      const eyes = document.querySelector(`div[data-testid="icon-eye"]`)
      const spyEyes = jest.spyOn(billContainer, "handleClickIconEye")
      eyes.addEventListener("click", () => billContainer.handleClickIconEye(eyes))
      eyes.click()
      expect(spyEyes).toHaveBeenCalled();
    })
    test("then clicking on new bill button redirects to 'NewBill'", () => {
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      const spyNew = jest.spyOn(billContainer, "handleClickNewBill")
      buttonNewBill.addEventListener("click", billContainer.handleClickNewBill())
      buttonNewBill.click()
      expect(spyNew).toHaveBeenCalled();
    });
  })
  describe("When I Navigate to bills page", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
    })
    test("fetches bills", async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const store = await mockStore.bills().list();
      const contentName = await screen.getByText(store[0].name).textContent
      expect(contentName).toMatch("encore")
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})
