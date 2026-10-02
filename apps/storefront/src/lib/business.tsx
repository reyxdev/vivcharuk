import { createContext, useContext } from 'react';
import { DEFAULT_SITE_CONTACT, liveBusiness, type LiveBusiness } from '@vivcharyk/schemas';

// D28: hours, the shop phone and the public e-mail come from the panel (GET /site/settings, read by the
// locale layout); every component reads them here. Outside the layout the code defaults stand.
const Ctx = createContext<LiveBusiness>(liveBusiness(DEFAULT_SITE_CONTACT));
export const BusinessProvider = Ctx.Provider;
export const useBusiness = () => useContext(Ctx);
