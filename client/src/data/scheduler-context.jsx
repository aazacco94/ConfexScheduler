import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

// Action types for the reducer. Values are arbitrary but unique.
const ACTION_RESET = 4400;
const ACTION_SET_SESSIONS = 4401;
const ACTION_SET_ROOMS = 4402;
const ACTION_SET_DATES = 4403;
const ACTION_SET_FILTERS = 4404;

// Initial state is set by the SchedulerProvider component
const SchedulerContext = createContext(null);

/*
 * Components that are nested within a SchedulerProvider component can use this
 * hook in order to consume and modify the state. E.g:
 *
 * const context = useSchedulerContext();
 */
const useSchedulerContext = () => {
  const context = useContext(SchedulerContext);
  if (context === undefined) {
    throw new Error('useSchedulerContext may only be used in the context of a '
      + 'SchedulerProvider component');
  }
  return context;
};

/*
 * Current user selections will be stored here.
 * The state should only consist of things that are needed across pages or
 * things that need to be re-used when the user comes back from another page.
 *
 * The functions are only placeholders and will be setup to point to the dispatch
 * by the SchedulerProvider.
 */
const initialState = {
  reset: () => {},
  sessions: [],
  setSessions: () => {},
  dates: {
    weekdays: [],
    times: [],
  },
  setDates: () => {},
  rooms: [],
  setRooms: () => {},
  filters: {
    formats: [],
    topics: [],
    types: [],
    properties: [],
    roomSetups: [],
    avSetups: [],
    minCapacity: null,
    maxCapacity: null,
  },
  setFilters: () => {},
};

const reducer = (state, action) => {
  const { type, payload } = action;
  // Not implemented: the payload should conform to a schema or be validated
  // depending on the type of action

  switch (type) {
    case ACTION_SET_SESSIONS:
      return { ...state, sessions: (Array.isArray(payload) ? payload : state.sessions) };
    case ACTION_SET_DATES:
      return { ...state, dates: (typeof payload === 'object' ? payload : state.dates) };
    case ACTION_SET_ROOMS:
      return { ...state, rooms: (Array.isArray(payload) ? payload : state.rooms) };
    case ACTION_SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...payload } };
    case ACTION_RESET:
      return {
        ...state,
        sessions: [],
        rooms: [],
        dates: {
          weekdays: [],
          times: [],
        },
        filters: {
          formats: [],
          topics: [],
          types: [],
          properties: [],
          roomSetups: [],
          avSetups: [],
          minCapacity: null,
          maxCapacity: null,
        },
      };
    default:
      throw new Error(`Unknown action ${type}`);
  }
};

/*
 * Provides the state to the children components.
 * Children components can consume the state by using the hook useSchedulerContext.
 */
function SchedulerProvider({ children }) {
  const [context, dispatch] = useReducer(reducer, initialState, undefined);

  // Map context functions to dispatch actions
  context.setSessions = useCallback(payload => {
    dispatch({ type: ACTION_SET_SESSIONS, payload });
  }, []);
  context.setDates = useCallback(payload => {
    dispatch({ type: ACTION_SET_DATES, payload });
  }, []);
  context.setRooms = useCallback(payload => {
    dispatch({ type: ACTION_SET_ROOMS, payload });
  }, []);
  context.setFilters = useCallback(payload => {
    dispatch({ type: ACTION_SET_FILTERS, payload });
  }, []);
  context.reset = useCallback(() => {
    dispatch({ type: ACTION_RESET });
  }, []);

  return (
    <SchedulerContext.Provider value={context}>
      {children}
    </SchedulerContext.Provider>
  );
}

SchedulerProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export { SchedulerProvider, useSchedulerContext };
