const REPORT_RECIPIENTS_BY_STATE = {
  Tamilnadu: {
    email1: "keerthi@earthrecycler.com",
    email2: "enosh@earthrecycler.com",
    email3: "dawood@earthrecycler.com",
    email4: " vivek.nair@earthrecycler.com",
    email5: "abdul@earthrecycler.com",
    email6: "kiran@wisebin.in"
  },
  Karnataka: {
    email1: "ranjan@wisebin.in",
    email2: "divakaran@wisebin.in",
    email3: "aiyappa@wisebin.in",
    email4: "accounts@wisebin.in",
    email5: "somanna.pc@wisebin.in",
    email6: "operations@wisebin.in",
    email7: "finance.wisebin@wisebin.in",
    email8: "dileep@wisebin.in",
    email9: "rasia@earthrecycler.com"
  },
};

const GLOBAL_REPORT_RECIPIENTS = ["sustainability.data@decathlon.com"];

const normalizeStateKey = (state = "") =>
  state.toString().trim().toLowerCase().replace(/\s+/g, " ");

const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const getReportRecipientsByState = (state) => {
  if (!state) {
    return [];
  }

  const normalizedState = normalizeStateKey(state);
  const matchedEntry = Object.entries(REPORT_RECIPIENTS_BY_STATE).find(
    ([stateName]) => normalizeStateKey(stateName) === normalizedState
  );

  if (!matchedEntry) {
    return [];
  }

  const [, recipientsConfig] = matchedEntry;
  const rawRecipients = Array.isArray(recipientsConfig)
    ? recipientsConfig
    : Object.values(recipientsConfig || {});

  return [
    ...new Set(
      [...rawRecipients, ...GLOBAL_REPORT_RECIPIENTS]
        .map((email) => email?.trim())
        .filter(isValidEmail)
    ),
  ];
};

export default REPORT_RECIPIENTS_BY_STATE;
