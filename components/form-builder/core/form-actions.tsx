"use client";

import { createContext, useContext } from "react";

type FormActions = {
    /** Validates the form and, when it is valid, saves it. Same as pressing Save. */
    requestSave: () => void;
};

const FormActionsContext = createContext<FormActions>({ requestSave: () => {} });

/** Gives the fields inside a form a way to ask the form to do something. */
export const FormActionsProvider = FormActionsContext.Provider;

/** For a field that needs to act on its form, e.g. a switch that saves when flipped. */
export const useFormActions = (): FormActions => useContext(FormActionsContext);
