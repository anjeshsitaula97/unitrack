/**
 * Framer Motion feature bundle, loaded on demand.
 *
 * `LazyMotion` starts with no animation features so the initial bundle stays
 * small; this module pulls in the DOM animation features once the landing
 * page hydrates. Kept in its own file so the dynamic import below actually
 * code-splits it away from the eager entry chunk.
 */
import { domAnimation } from "framer-motion";

export default domAnimation;
