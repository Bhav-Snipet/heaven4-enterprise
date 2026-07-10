package com.heaven4.engines.workflow;

/**
 * Workflow Engine — manages state machines and transitions across all domains.
 *
 * <p>Controls: order states, payment states, dining session states, task states,
 * approval states. Every state transition must go through this engine.
 *
 * @param <S> The state enum type
 * @param <E> The entity type being transitioned
 */
public interface WorkflowEngine<S extends Enum<S>, E> {

    /**
     * Returns the current state of the given entity.
     */
    S getCurrentState(E entity);

    /**
     * Attempts a state transition. Throws BusinessException if the transition is invalid.
     */
    E transition(E entity, S targetState, String reason);

    /**
     * Checks whether a transition from the current state to the target state is valid.
     */
    boolean canTransition(E entity, S targetState);

    /**
     * Returns all valid next states from the entity's current state.
     */
    java.util.List<S> getAllowedTransitions(E entity);
}
