const Field = require("@saltcorn/data/models/field");
const Table = require("@saltcorn/data/models/table");
const Form = require("@saltcorn/data/models/form");
const View = require("@saltcorn/data/models/view");
const File = require("@saltcorn/data/models/file");
const Trigger = require("@saltcorn/data/models/trigger");
const FieldRepeat = require("@saltcorn/data/models/fieldrepeat");
const db = require("@saltcorn/data/db");
const WorkflowRun = require("@saltcorn/data/models/workflow_run");
const Workflow = require("@saltcorn/data/models/workflow");
const { div, script, domReady, a, br, img } = require("@saltcorn/markup/tags");
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

const configuration_workflow = (modcfg) => (req) =>
  new Workflow({
    onDone: async (ctx) => {
      if (!ctx.elevenlabs_agent_id) {
        const client = new ElevenLabsClient({
          apiKey: modcfg.api_key,
        });
        const createres = await client.conversationalAi.agents.create({
          conversationConfig: {},
        });
        console.log({ createres });
        ctx.elevenlabs_agent_id = createres.agentId;
      }
      return ctx;
    },
    steps: [
      {
        name: "Agent action",

        form: async (context) => {
          const agent_actions = await Trigger.find({ action: "Agent" });
          return new Form({
            fields: [
              {
                name: "action_id",
                label: "Agent action",
                type: "String",
                required: true,
                attributes: {
                  options: agent_actions.map((a) => ({
                    label: a.name,
                    name: a.id,
                  })),
                },
                sublabel:
                  "A trigger with <code>Agent</code> action. " +
                  a(
                    {
                      "data-dyn-href": `\`/actions/configure/\${action_id}\``,
                      target: "_blank",
                    },
                    "Configure",
                  ),
              },
              {
                name: "elevenlabs_agent_id",
                label: "11labs Agent ID",
                sublabel: "Leave blank to create a new agent",
                type: "String",
              },
            ],
          });
        },
      },
    ],
  });

const get_state_fields = async (table_id) =>
  table_id
    ? [
        {
          name: "id",
          type: "Integer",
          primary_key: true,
        },
      ]
    : [];

const run =
  (modcfg) =>
  async (
    table_id,
    viewname,
    {
      action_id,
      agent_action,
      show_prev_runs,
      prev_runs_closed,
      placeholder,
      explainer,
      image_upload,
      stream,
      audio_recorder,
      layout,
    },
    state,
    { res, req },
  ) => {
    const action = agent_action || (await Trigger.findOne({ id: action_id }));
    if (!action) throw new Error(`Action not found: ${action_id}`);

    return "Agent view goes here";
  };

module.exports = (modcfg) => ({
  name: "ElevenLabs Agent Chat",
  configuration_workflow: configuration_workflow(modcfg),
  display_state_form: false,
  get_state_fields,
  //tableless: true,
  table_optional: true,
  run: run(modcfg),
  //routes: { interact, delprevrun, debug_info, skillroute, execute_user_action },
  //mobile_render_server_side: true,
});
