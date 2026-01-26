import {ModuleDefinition} from "./module_definition";
import {BlocklyBlock, QuickalgoLibraryBlock} from "../definitions";

export function useGeneratorName(module: ModuleDefinition, generatorName: string): ModuleDefinition {
  for (let feature of Object.values(module)) {
    feature.generatorName = generatorName;
  }

  return module;
}

export function getBlockGeneratorParams(blockInfo: QuickalgoLibraryBlock, block: BlocklyBlock, language) {
  let params = "";
  let args0 = blockInfo.blocklyJson.args0;
  let blockParams = blockInfo.params;

  /* There are three kinds of input: value_input, statement_input and dummy_input,
     We should definitely consider value_input here and not consider dummy_input here.

     I don't know how statement_input is handled best, so I'll ignore it first -- Robert
   */
  let iParam = 0;
  for (let iArgs0 in args0) {
    if (args0[iArgs0].type == "input_value") {
      if (iParam) {
        params += ", ";
      }

      if (blockParams && blockParams[iArgs0] == 'Statement') {
        params += "function () {\n  " + window.Blockly.JavaScript.statementToCode(block, 'PARAM_' + iParam) + "}";
      } else {
        params += window.Blockly[language].valueToCode(block, 'PARAM_' + iParam, window.Blockly[language].ORDER_ATOMIC);
      }
      iParam += 1;
    }
    if (args0[iArgs0].type == "field_number"
      || args0[iArgs0].type == "field_angle"
      || args0[iArgs0].type == "field_dropdown"
      || args0[iArgs0].type == "field_input") {
      if (iParam) {
        params += ", ";
      }
      let fieldValue = block.getFieldValue('PARAM_' + iParam);
      if (blockParams && blockParams[iArgs0] == 'Number') {
        params += parseInt(fieldValue);
      } else {
        params += JSON.stringify(fieldValue);
      }
      iParam += 1;
    }
    if (args0[iArgs0].type == "field_colour") {
      if (iParam) {
        params += ", ";
      }
      params += '"' + block.getFieldValue('PARAM_' + iParam) + '"';
      iParam += 1;
    }
  }

  return params;
}
