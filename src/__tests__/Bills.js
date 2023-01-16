/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      // on simule l'affichage des factures ( déjà triées par date)
      document.body.innerHTML = BillsUI({ data: bills });
      // on récupère les dates affichées
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      // on vérifie que les dates sont bien dans l'ordre chronologique
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe("When i navigate to bills", () => {
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
