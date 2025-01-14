/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // test 1 
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      // expect 
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
    // test 2
    test("Then bills should be ordered from earliest to latest", () => {
      // on simule l'affichage des factures ( déjà triées par date)
      document.body.innerHTML = BillsUI({ data: bills });
      // on récupère les dates affichées
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      // on vérifie que les dates sont bien dans l'ordre antichronologique
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // vérification d'affichage de la page new bill
    describe("When I click on the New Bill button", () => {
      // test 3
      test("Then it should render NewBill page", () => {
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        const newBill = screen.getByTestId("btn-new-bill");
        newBill.click();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });
    // test 4
    test("Then it should render getBills", async () => {
      const onNavigate = (pathname) => {
        // on simule la navigation ver la page
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // on simule un utilisateur
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // on simule la création d'une note de frais 
      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      // on simule l'appel de la fonction getBills
      const getBills = await bills.getBills();
      // si la date apparait avec la valeur et le format déterminé c'est que ça fonctionne
      expect(getBills[0].formatedDate).toBe("4 Avr. 04");
    });
  });
  
  describe("When i navigate to bills", () => {
    // test 5 
    test("The it should render bills page", async () => {
      // simulation d'un utilisateur employee
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "e@e" })
      );
      // simulation d'interface
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // routage vers la page Bills
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      // on attend de voir à l'écran ''mes notes de frais''
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
    // test 6 
    test("Then click on icon-eye should make the modal open", async () => {
      //  création d'une fonction basée sur jest.fn
      $.fn.modal = jest.fn();
      // simulation d'un utilisateur employee
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "e@e" })
      );
      // simulation d'interface
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // routage vers la page Bills
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      // on attend de voir à l'écran ''mes notes de frais''
      await waitFor(() => screen.getByText("Mes notes de frais"));
      // on récupère toutes les icones icon-eye
      const iconEye = screen.getAllByTestId("icon-eye");
      // pour chacune des icones au click on verifie que la fonction ait bient été appelée
      iconEye.forEach((icon) => {
        icon.click();
        expect($.fn.modal).toHaveBeenCalled();
      });
    });
  });
});
