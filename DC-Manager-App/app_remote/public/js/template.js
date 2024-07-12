export const messageTemplates = {
  "Low CPU Frequency": `Hi Support,\n\nThe machine(s) at \n\n{ipAddress}\n\nis reporting low CPU frequency. Here are the following BIOS Settings that need to be modified:\n\nBoot Performance Mode: Turbo Performance\nIntel® SpeedStep™:  Enabled\nTurbo Mode: Enabled\nC-States: Disabled\n\nIf you need assistance in locating any of the BIOS settings, please provide the motherboard model and a screenshot of the options and we can assist you in locating the options to change.\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nPlease let us know what adjustments you've made and when it's safe to add the machine back to production.\n\nThanks!\n{{ticket.submitter.name}}`,
  "Machine reporting unreachable": `Hi Support,\n\nThe following list of the machine(s) has gone unreachable from our side.\n\n{ipAddress}\n\nPlease investigate the cause. If there are problems with the OS please clarify what the screen is showing by checking via IPMI. Once and only if you have confirmed the state of what the screen is showing, you can reboot if necessary but provide us with any errors in the IPMI logs as well.\n\nThe machine has been taken out of production so feel free to reboot as necessary to diagnose this. DOWNTIME IS ACCEPTED\n\nThanks!\n{{ticket.submitter.name}}`,
  "CPU Governor Errors & OS CPU Scaling": `Hi Support,\n\nThe machine(s) \n\n{ipAddress}\n\nis showing a CPU scaling error.\n\ncat: /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor: No such file or directory\n{ipAddress} C-State Enabled - Must be Disabled  - Gov:\n\nPlease ensure c-state is disabled\nPlease ensure Turbo Mode is enabled\nPlease ensure EIST / Speed Step is enabled (OS DBPM on Dell machines)\nDowntime is accepted,\nThanks!\n{{ticket.submitter.name}}`,
  "CPU high temperature": `Hi Support,\n\nWe are seeing very high CPU temperatures on \n\n{ipAddress}\n\nWhile running on high loads. Here is the logs that show that information:\n{logs}\n\nWould you be able to check the chassis fan speeds (set to max), CPU temperatures, and the BIOS performance configuration (performance mode should be enabled) to make sure everything is configured correctly?\n\nTo assist in your investigation, here is a list of potential causes behind the high CPU temperatures:\n- BIOS settings set to power saver mode= Please Disable power save\n- Capped fan speeds= Please set to max\n- Faulty RAM= Please let us know if it needs replacing\n- PSU kicking the machine into Safety / Emergency Mode= Please replace the faulty psu\n- Outdated firmware= please update them\n- Disable C-states in bios.\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nThanks!\n{{ticket.submitter.name}}`,
  "RAM Issues": `Hi Support,\n\nThe machine(s) at \n\n{ipAddress}\n\nis running into RAM errors. Please replace the affected RAM on this machine indicated in the dmesg errors below:\n\n{logs}\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nPlease let us know when the RAM has been replaced so we can check for any new errors and add the machine back to production.\n\nThanks!\n{{ticket.submitter.name}}`,
  "Disk shows I/O errors": `Hi Team,\n\nThe machine(s) at \n\n{ipAddress}\n\nis running into disk I/O errors. Please run a hard drive test to see if there are any issues there. If there are, please replace the disk and reinstall the OS. If the hard drive test confirms that there aren't any issues, please reinstall the OS.\n\n{logs}\n\nDOWNTIME AND DATA LOSS IS ACCEPTED.\n\nThe OS will be {osVersion}\nPlease make sure the IP remains the same. \nPlease configure our SSH key and disable password authentication.\n\nThanks!\n{{ticket.submitter.name}}`,
  "Read-only file system error": `Hi Team,\n\nThe machine(s) at \n\n{ipAddress}\n\nis running into read-only filesystem errors. Please run a hard drive test to see if there are any issues there. If there are, please replace the disk and reinstall the OS. If the hard drive test confirms that there aren't any issues, please reinstall the OS.\n\n{logs}\n\nDOWNTIME AND DATA LOSS IS ACCEPTED.\n\nThe OS will be {osVersion}\nPlease make sure the IP remains the same. \nPlease configure our SSH key and disable password authentication.\n\nThanks!\n{{ticket.submitter.name}}`,
  "Abuse Report": `Hi @here! ZD-{zendeskTicketId}\n\nWe have received an abuse report for the machine(s):\n\n{ipAddress}\n\nIt is possible that this is a case of IP spoofing but please could you ask your sec team to investigate this machine for rogue processes/elements?\n\nThanks!\n{{ticket.submitter.name}}`,
  "Network Interface Card Error": `Hi Support,\n\n{ipAddress}\n\nThe above machines' network card has registered multiple errors. Please can you perform an extended network test on this.\n\n{logs}\n\nThanks!\n{{ticket.submitter.name}}`,
  "BIOS Settings Error": `Hey Support,\n\nThe machine(s) \n\n{ipAddress}\n\nneeds to have their BIOS settings set correctly. Please make sure the following are enabled in BIOS:\n\nBoot Performance Mode: Turbo Performance\nIntel® SpeedStep™:  Enabled\nTurbo Mode: Enabled\nC-States: Disabled\n\nIf you need assistance in locating any of the BIOS settings, please provide the motherboard model and a screenshot of the options and we can assist you in locating the options to change.\n\nThe machine has been taken out of production so DOWNTIME IS ACCEPTED.\n\nPlease let us know what adjustments you've made and when it's safe to add the machine back to production.\n\nThanks!\n{{ticket.submitter.name}}`,
  "OS Reinstall": `Hey Support,\n\nCan you please reinstall the OS on the machine(s) below:\n\n{ipAddress}\n\nOS: {osVersion}\n\nDowntime/dataloss are accepted\nPlease make sure the IP remains the same. \nPlease configure our SSH key and disable password authentication.\n\nThanks!\n{{ticket.submitter.name}}`,
};

export function getTemplateVars(template) {
  const vars = [];
  const regex = /\{(\w+)\}/g;
  let match;
  while ((match = regex.exec(template)) !== null) {
    vars.push(match[1]);
  }
  return vars;
}

export function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}
