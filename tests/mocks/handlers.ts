import { http, HttpResponse } from "msw";

const themePayload = {
  data: {
    colors: {
      Blue: {
        light: {
          primary: "221.2 83.2% 53.3%",
          background: "0 0% 100%",
        },
        dark: {
          primary: "217.2 91.2% 59.8%",
          background: "222.2 84% 4.9%",
        },
      },
    },
  },
};

export const handlers = [
  http.get("*/api/theme", () => {
    return HttpResponse.json(themePayload);
  }),
];
