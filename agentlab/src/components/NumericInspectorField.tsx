import { useEffect, useId, useState } from "react";

type NumericInspectorFieldProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
};

function NumericInspectorField({
    label,
    value,
    min,
    max,
    step = 1,
    onChange
}: NumericInspectorFieldProps) {
    const inputId = useId();
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    const handleBlur = () => {
        const parsedValue = Number(inputValue);

        if (
            inputValue.trim() === "" ||
            !Number.isFinite(parsedValue) ||
            parsedValue < min ||
            parsedValue > max
        ) {
            setInputValue(String(value));
            return;
        }

        onChange(parsedValue);
    };

    return (
        <div className="inspector-field">
            <label htmlFor={inputId}>{label}</label>

            <input
                id={inputId}
                type="number"
                min={min}
                max={max}
                step={step}
                value={inputValue}
                onChange={(event) => {
                    setInputValue(event.target.value);
                }}
                onBlur={handleBlur}
            />
        </div>
    );
}

export default NumericInspectorField;