export default function isLmsBudget(activeIntegrationsLength, isUniversalGroup) {
  return activeIntegrationsLength > 0 && isUniversalGroup;
}
