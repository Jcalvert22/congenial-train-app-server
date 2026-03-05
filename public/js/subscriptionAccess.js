const DEFAULT_SUBSCRIPTION_STATE = true;
const META_FLAG_NAME = 'next-public-subscriptions-enabled';

function parseBooleanFlag(value) {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number') {
		return value !== 0;
	}
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (!normalized) {
			return null;
		}
		if (['false', '0', 'off', 'disabled', 'no'].includes(normalized)) {
			return false;
		}
		if (['true', '1', 'on', 'enabled', 'yes'].includes(normalized)) {
			return true;
		}
	}
	return null;
}

function readWindowFlag() {
	if (typeof window === 'undefined') {
		return null;
	}
	if (typeof window.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'undefined') {
		return window.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED;
	}
	const meta = window.document?.querySelector(`meta[name="${META_FLAG_NAME}"]`);
	if (!meta) {
		return null;
	}
	const content = meta.getAttribute('content');
	return typeof content === 'string' ? content : null;
}

function readProcessEnvFlag() {
	if (typeof process === 'undefined' || !process.env) {
		return null;
	}
	if (typeof process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'undefined') {
		return null;
	}
	return process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED;
}

function readImportMetaFlag() {
	try {
		const meta = import.meta;
		if (meta && meta.env && typeof meta.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED !== 'undefined') {
			return meta.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED;
		}
	} catch (error) {
		return null;
	}
	return null;
}

function resolveFlag() {
	const sources = [readWindowFlag, readImportMetaFlag, readProcessEnvFlag];
	for (const getValue of sources) {
		const value = getValue();
		if (value !== null && typeof value !== 'undefined') {
			const parsed = parseBooleanFlag(value);
			if (typeof parsed === 'boolean') {
				return parsed;
			}
		}
	}
	return DEFAULT_SUBSCRIPTION_STATE;
}

const SUBSCRIPTIONS_ENABLED = resolveFlag();

export function areSubscriptionsEnabled() {
	return SUBSCRIPTIONS_ENABLED;
}
