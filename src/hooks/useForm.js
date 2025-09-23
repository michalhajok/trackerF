"use client";

import { useState, useCallback, useRef } from "react";
import { useFormDraft } from "./useLocalStorage";

/**
 * Custom hook for form handling with validation and draft saving
 */
export function useForm(initialValues = {}, options = {}) {
  const {
    validate,
    onSubmit,
    enableDraft = false,
    draftKey,
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  // Form draft functionality
  const { draft, saveDraft, clearDraft } = useFormDraft(draftKey || "default");

  // Initialize values with draft if available
  const initValues =
    enableDraft && Object.keys(draft).length > 0
      ? { ...initialValues, ...draft }
      : initialValues;

  const [values, setValues] = useState(initValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const formRef = useRef(null);

  // Validate single field
  const validateField = useCallback(
    async (name, value) => {
      if (!validate) return null;

      try {
        await validate({ [name]: value });
        return null;
      } catch (validationErrors) {
        return validationErrors[name] || null;
      }
    },
    [validate]
  );

  // Validate all fields
  const validateForm = useCallback(async () => {
    if (!validate) return {};

    try {
      await validate(values);
      return {};
    } catch (validationErrors) {
      return validationErrors || {};
    }
  }, [validate, values]);

  // Set field value
  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => {
        const newValues = { ...prev, [name]: value };

        // Save draft if enabled
        if (enableDraft) {
          saveDraft(newValues);
        }

        return newValues;
      });

      // Validate on change if enabled
      if (validateOnChange && touched[name]) {
        validateField(name, value).then((error) => {
          setErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
        });
      }
    },
    [enableDraft, saveDraft, validateOnChange, touched, validateField]
  );

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback(
    (name, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));

      // Validate on blur if enabled
      if (validateOnBlur && isTouched) {
        validateField(name, values[name]).then((error) => {
          setErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
        });
      }
    },
    [validateOnBlur, validateField, values]
  );

  // Handle input change
  const handleChange = useCallback(
    (nameOrEvent, value) => {
      const name =
        typeof nameOrEvent === "string" ? nameOrEvent : nameOrEvent.target.name;
      const val =
        typeof nameOrEvent === "string" ? value : nameOrEvent.target.value;

      setFieldValue(name, val);
    },
    [setFieldValue]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (nameOrEvent) => {
      const name =
        typeof nameOrEvent === "string" ? nameOrEvent : nameOrEvent.target.name;

      setFieldTouched(name, true);
    },
    [setFieldTouched]
  );

  // Reset form
  const resetForm = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setSubmitCount(0);

      if (enableDraft) {
        clearDraft();
      }
    },
    [initialValues, enableDraft, clearDraft]
  );

  // Submit form
  const handleSubmit = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault();
      }

      setIsSubmitting(true);
      setSubmitCount((prev) => prev + 1);

      // Mark all fields as touched
      const touchedFields = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(touchedFields);

      // Validate form
      const validationErrors = await validateForm();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        try {
          if (onSubmit) {
            await onSubmit(values, { resetForm, setFieldError });
          }

          // Clear draft on successful submit
          if (enableDraft) {
            clearDraft();
          }
        } catch (submitError) {
          console.error("Form submission error:", submitError);
        }
      }

      setIsSubmitting(false);
    },
    [
      values,
      validateForm,
      onSubmit,
      resetForm,
      setFieldError,
      enableDraft,
      clearDraft,
    ]
  );

  // Get field helpers
  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] || "",
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, handleChange, handleBlur, touched, errors]
  );

  // Form state
  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const hasDraft = enableDraft && Object.keys(draft).length > 0;

  return {
    // Values
    values,
    errors,
    touched,

    // State
    isSubmitting,
    isValid,
    isDirty,
    submitCount,
    hasDraft,

    // Actions
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm,

    // Helpers
    getFieldProps,
    formRef,

    // Draft
    clearDraft: enableDraft ? clearDraft : undefined,
  };
}

export default useForm;
