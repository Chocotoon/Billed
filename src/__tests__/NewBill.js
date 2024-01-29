/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import { ROUTES_PATH } from "../constants/routes.js";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    const html = NewBillUI()
    document.body.innerHTML = html

    let newBillContainer = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: {}

    })

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    test("Then clicking on submit button will call handleSubmit function", () => {
      const e = {
        preventDefault: jest.fn(),

        target: {
          querySelector: jest.fn(() => ({

          })),
          value: ""
        }
      }
      newBillContainer.handleSubmit(e)
      expect(e.preventDefault).toHaveBeenCalled()

    }
    )
    describe("When I upload a file", () => {
      test("Then uploading file with wrong extension will trigger an alert and empty input", () => {

        window.alert = jest.fn();

        const e = {
          preventDefault: jest.fn(),
          target: {
            value: "document.txt",
            querySelector: jest.fn()
          },
        };

        newBillContainer.handleChangeFile(e)
        expect(e.preventDefault).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalledWith("Extension de fichier non autorisée. Veuillez sélectionner un fichier .jpg, .jpeg ou .png.")
        expect(e.target.value).toBe("")

      })
      test("Then uploading a file with correct extension will add file", () => {
        const e = {
          preventDefault: jest.fn(),
          target: {
            value: "document.png",
            querySelector: jest.fn(),

          },
        };
        newBillContainer.handleChangeFile(e)
        expect(e.target.value).toBe("document.png")
      })
    })

  })
  describe("Post new bill integration test suites", async () => {
    window.alert = jest.fn()
    const formNewBill = screen.getByTestId("form-new-bill")
    describe("When submitting new bill form", () => {
      test("then it send an alert if expense type is missing", () => {
        const expenseInput = screen.getByTestId("expense-type")
        expenseInput.value = ""
        formNewBill.submit()
        expect(window.alert).toHaveBeenCalled()

      })

      test("Then it should send an alert if date is missing", () => {
        const dateInput = screen.getByTestId("datepicker")
        dateInput.value = ""
        formNewBill.submit()
        expect(window.alert).toHaveBeenCalled()

      })

      test("Then it should send an alert if amount is missing", () => {
        const amountInput = screen.getByTestId("amount")
        amountInput.value = ""
        formNewBill.submit()
        expect(window.alert).toHaveBeenCalled()

      })

      test("Then it should send an alert if vat pct is missing", () => {
        const pctInput = screen.getByTestId("pct")
        pctInput.value = ""
        formNewBill.submit()
        expect(window.alert).toHaveBeenCalled()

      })

      test("Then it should send an alert if file is missing", () => {
        const fileInput = screen.getByTestId("file")
        fileInput.value = ""
        formNewBill.submit()
        expect(window.alert).toHaveBeenCalled()

      })

      test("Then it should not send an alert if fields are correctly filled", () => {
        window.alert.mockRestore()
        window.alert = jest.fn()

        const typeInput = screen.getByTestId("expense-type");
        const nameInput = screen.getByTestId("expense-name");
        const dateInput = screen.getByTestId("datepicker");
        const amountInput = screen.getByTestId("amount");
        const vatInput = screen.getByTestId("vat")
        const pctInput = screen.getByTestId("pct");
        const commentaryInput = screen.getByTestId("commentary")

        typeInput.value = "Transports"
        nameInput.value = "fake"
        dateInput.value = new Date(30 / 11 / 2021)
        amountInput.value = 20
        vatInput.value = 2
        pctInput.value = 10
        commentaryInput.value = "fake"

        formNewBill.submit()
        expect(window.alert).not.toHaveBeenCalled()

      })
      test("then it should create new bill with input information and navigate to bills page", async () => {

        let newBillContainer = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: {}

        })

        const getlocalStorage = localStorage.getItem("user");
        const localStorageparse = JSON.parse(getlocalStorage);
        const email = JSON.parse(localStorageparse).email;

        const typeInput = screen.getByTestId("expense-type");
        const nameInput = screen.getByTestId("expense-name");
        const dateInput = screen.getByTestId("datepicker");
        const amountInput = screen.getByTestId("amount");
        const vatInput = screen.getByTestId("vat")
        const pctInput = screen.getByTestId("pct");
        const commentaryInput = screen.getByTestId("commentary")

        const bill = {
          type: typeInput.value,
          name:  nameInput.value,
          amount: amountInput.value,
          date:  dateInput.value,
          vat: vatInput.value,
          pct: pctInput.value,
          commentary: commentaryInput.value,
          fileUrl: "path/document.png",
          fileName: "document.png",
          status: 'pending'
        }

        const newBillMethod = mockStore.bills()
        const mockBillCreateSpy = spyOn(newBillMethod, "create")
        const newBillNavigateSpy = spyOn(newBillContainer, "onNavigate")
        formNewBill.submit()
        await mockBillCreateSpy({ email, ...bill }) 
        expect(mockBillCreateSpy).toHaveBeenCalledWith(bill)
        expect(newBillNavigateSpy).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
      })
    })
  })
})