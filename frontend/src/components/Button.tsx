import type { MouseEventHandler } from "react";


interface ButtonProps {
    text: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}

export const Button = ({
    text,
    onClick,
    type = "button",
    disabled = false,
}: ButtonProps) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className=" hover:cursor-pointer"
        >
            {text}
        </button>
    );
};