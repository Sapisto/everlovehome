import type { CarePlan } from "./careFinder";

/** Fired by the care-plan builder; the contact form listens and pre-fills itself. */
export const CARE_PLAN_EVENT = "everlove:careplan";

declare global {
  interface WindowEventMap {
    [CARE_PLAN_EVENT]: CustomEvent<CarePlan>;
  }
}
