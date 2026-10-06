<?php
/**
 * Nexo - Input Validation and Sanitization
 */

declare(strict_types=1);

namespace App\Core;

class Validator {
    private array $errors = [];
    private array $data = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    public static function make(array $data, array $rules): self {
        $validator = new self($data);
        $validator->validate($rules);
        return $validator;
    }

    public function validate(array $rules): void {
        foreach ($rules as $field => $fieldRules) {
            $rulesList = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;
            $value = $this->data[$field] ?? null;

            foreach ($rulesList as $rule) {
                $params = [];
                if (str_contains($rule, ':')) {
                    [$ruleName, $paramStr] = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                } else {
                    $ruleName = $rule;
                }

                $this->applyRule($field, $value, $ruleName, $params);
            }
        }
    }

    private function applyRule(string $field, mixed $value, string $rule, array $params): void {
        switch ($rule) {
            case 'required':
                if ($value === null || trim((string)$value) === '') {
                    $this->addError($field, "El campo {$field} es obligatorio.");
                }
                break;

            case 'email':
                if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "El campo {$field} debe ser un correo electrónico válido.");
                }
                break;

            case 'min':
                $min = (int)($params[0] ?? 0);
                if ($value && mb_strlen((string)$value) < $min) {
                    $this->addError($field, "El campo {$field} debe tener al menos {$min} caracteres.");
                }
                break;

            case 'max':
                $max = (int)($params[0] ?? 255);
                if ($value && mb_strlen((string)$value) > $max) {
                    $this->addError($field, "El campo {$field} no debe exceder {$max} caracteres.");
                }
                break;

            case 'numeric':
                if ($value && !is_numeric($value)) {
                    $this->addError($field, "El campo {$field} debe ser un número.");
                }
                break;

            case 'in':
                if ($value && !in_array($value, $params, true)) {
                    $options = implode(', ', $params);
                    $this->addError($field, "El campo {$field} debe ser uno de los siguientes: {$options}.");
                }
                break;
        }
    }

    public function addError(string $field, string $message): void {
        $this->errors[$field][] = $message;
    }

    public function fails(): bool {
        return !empty($this->errors);
    }

    public function passes(): bool {
        return empty($this->errors);
    }

    public function errors(): array {
        return $this->errors;
    }

    public function firstError(): ?string {
        foreach ($this->errors as $messages) {
            return $messages[0] ?? null;
        }
        return null;
    }

    public static function sanitize(mixed $data): mixed {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        if (is_string($data)) {
            return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }
}
