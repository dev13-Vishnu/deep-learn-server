import { container } from "../../infrastructure/di/container";

export function getController<T>(type: symbol): T {
    return container.get<T>(type);
}