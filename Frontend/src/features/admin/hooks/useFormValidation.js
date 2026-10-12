import { useState, useCallback, useMemo } from 'react'

/**
 * useFormValidation — Hook para validación reactiva en tiempo real (onChange/onBlur)
 * con feedback instantáneo y prevención de saltos de maquetación.
 *
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Object} validationRules - Reglas de validación por campo { [field]: { required, min, max, pattern, validate, message } }
 */
export function useFormValidation(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = useCallback(
    (name, value, allValues = values) => {
      const rule = validationRules[name]
      if (!rule) return ''

      // Si se define un validador personalizado
      if (typeof rule.validate === 'function') {
        const customError = rule.validate(value, allValues)
        if (customError) return customError
      }

      // Regla de obligatoriedad (required)
      if (rule.required) {
        if (value === null || value === undefined || String(value).trim() === '') {
          return rule.message || 'Este campo es obligatorio.'
        }
      }

      // Regla de mínimo numérico
      if (rule.min !== undefined && value !== '' && value !== null && value !== undefined) {
        const num = Number(value)
        if (Number.isNaN(num) || num < rule.min) {
          return rule.message || `El valor mínimo permitido es ${rule.min}.`
        }
      }

      // Regla de máximo numérico
      if (rule.max !== undefined && value !== '' && value !== null && value !== undefined) {
        const num = Number(value)
        if (Number.isNaN(num) || num > rule.max) {
          return rule.message || `El valor máximo permitido es ${rule.max}.`
        }
      }

      // Regla de longitud mínima
      if (rule.minLength && String(value || '').length < rule.minLength) {
        return rule.message || `Debe contener al menos ${rule.minLength} caracteres.`
      }

      // Regla de expresión regular (pattern)
      if (rule.pattern && value) {
        const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern)
        if (!regex.test(String(value))) {
          return rule.message || 'El formato ingresado no es válido.'
        }
      }

      return ''
    },
    [validationRules, values],
  )

  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => {
        const nextValues = { ...prev, [name]: value }
        // Si el campo ya fue tocado o hay error activo, validar reactivamente
        if (touched[name] || errors[name]) {
          const fieldError = validateField(name, value, nextValues)
          setErrors((prevErr) => ({ ...prevErr, [name]: fieldError }))
        }
        return nextValues
      })
    },
    [touched, errors, validateField],
  )

  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }))
      const fieldError = validateField(name, values[name], values)
      setErrors((prev) => ({ ...prev, [name]: fieldError }))
    },
    [values, validateField],
  )

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const validate = useCallback(() => {
    const nextErrors = {}
    const nextTouched = {}
    let valid = true

    Object.keys(validationRules).forEach((fieldName) => {
      nextTouched[fieldName] = true
      const errorMsg = validateField(fieldName, values[fieldName], values)
      if (errorMsg) {
        nextErrors[fieldName] = errorMsg
        valid = false
      }
    })

    setErrors(nextErrors)
    setTouched((prev) => ({ ...prev, ...nextTouched }))
    return valid
  }, [validationRules, values, validateField])

  const resetForm = useCallback(
    (newValues = initialValues) => {
      setValues(newValues)
      setErrors({})
      setTouched({})
    },
    [initialValues],
  )

  const isValid = useMemo(() => {
    return Object.values(errors).every((err) => !err)
  }, [errors])

  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] ?? '',
      onChange: (eventOrVal) => {
        const val = eventOrVal && eventOrVal.target ? eventOrVal.target.value : eventOrVal
        handleChange(name, val)
      },
      onBlur: () => handleBlur(name),
      error: Boolean(touched[name] && errors[name]),
      errorMessage: touched[name] ? errors[name] : '',
    }),
    [values, touched, errors, handleChange, handleBlur],
  )

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setValues,
    validate,
    resetForm,
    getFieldProps,
  }
}

export default useFormValidation
