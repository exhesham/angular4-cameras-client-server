import os
import subprocess
def run_bash_code(command, os_user=None):
    env = os.environ
    if os_user is not None:
        command = cmd_user_style(os_user, command)
    process = subprocess.Popen(command, shell=True, env=env)
    return process.wait()


def cmd_user_style(user, script):
    return "su - %s -c '%s'" % (user, script)


def run_script_output(script, e={}, user=None):
    if user is not None:
        script = convert_to_user_cmd(user, script)

    env = os.environ

    for k in e:
        env[k] = str(e[k])

    if dry:
        return 0

    logger.info("\tExecute: %s" % script)

    process = subprocess.Popen(script, shell=True, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    (out, err) = process.communicate()

    rt = process.returncode

    if rt == 0:

        logger.info("rc:%s stdout: %s", rt, out.strip())

        return rt, out.strip()

    else:

        # in general i would return only stdout, but some commands suc as db2icrt throws errors to stdout

        logger.info("rc:%s stdout+stderr: %s", rt, out + err.strip())

        return rt, out + err.strip()


def run_script_async(script, e={}):
    env = os.environ

    for k in e:
        env[k] = str(e[k])

    logger.info("\tExecute: %s" % script)

    return subprocess.Popen(script, shell=True, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def run_multiple_scripts(scripts, e={}, user=None):
    env = os.environ

    for k in e:
        env[k] = str(e[k])

    for cmd in scripts:

        validate = True

        if isinstance(cmd, dict):
            logger.info("\tExecute: %s" % cmd)

            validate = cmd['validate']

            cmd = cmd['cmd']

        (rt, out) = run_script_output(cmd, user=user)

        if validate and rt != 0:
            logger.info("There were some errors with the command: %s --> %s\n" % (cmd, out))

            return 1, out

    return 0, "SUCCESS"
