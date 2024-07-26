import { dirname, join } from "path";
import { fileURLToPath } from "url";

export function configureEnv() {
    global.$dir = () => dirname(fileURLToPath(import.meta.url));
    global.$dir.join = (...args) => join(global.$dir(), ...args);
}
