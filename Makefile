ACT_CMD=act --env HTTP_PROXY=${http_proxy} --env HTTPS_PROXY=${https_proxy} -r

# workflow events
# @see https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads
# @see https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
workflow-run-test:
	${ACT_CMD} pull_request

workflow-run-release:
	@mkdir -p .local
	@echo '{"ref": "refs/tags/v0.0.3-rc.1"}' > .local/tag-event.json
	${ACT_CMD} -e .local/tag-event.json -s CI_LOCAL_TEST=1 --artifact-server-path=.local/artifacts
