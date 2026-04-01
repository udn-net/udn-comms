import * as React from "bloatless-react";

import { Color } from "../../colors";

export function ColorPicker(selectedColor: React.State<Color>) {
    return (
        <div class="flex-row gap width-input">
            {...Object.values(Color).map((color) => {
                const isSelected = React.createProxyState(
                    [selectedColor],
                    () => selectedColor.value == color,
                );

                function setColor() {
                    selectedColor.value = color;
                }

                return (
                    <button
                        color={color}
                        class="fill-color width-100 flex"
                        style="height: 2rem"
                        toggle:selected={isSelected}
                        on:click={setColor}
                    ></button>
                );
            })}
        </div>
    );
}
