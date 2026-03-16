#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveSectorSignals, scoreSignals } from '../../src/server/sector/signalsCore.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function testScoreRubric() {
  const scores = scoreSignals([
    'Toezicht en regelgeving verhogen druk',
    'Contractmacht en tariefonderhandeling verschuiven',
    'Arbeidsmarktkrapte verhoogt uitval',
  ]);

  assert(scores.regulatorPressureIndex > 0, 'regulator score expected > 0');
  assert(scores.contractPowerScore > 0, 'contract score expected > 0');
  assert(scores.arbeidsmarktdrukIndex > 0, 'labor score expected > 0');
}

async function testCacheAndFetchMock() {
  const cachePath = path.resolve(process.cwd(), 'sector-signals-cache.json');
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => ({
    ok: true,
    async text() {
      return '<rss><item>Regelgeving contract arbeidsmarkt update</item></rss>';
    },
  }));

  try {
    const first = await resolveSectorSignals('gezondheidszorg');
    assert(Array.isArray(first.signals) && first.signals.length > 0, 'first fetch should return signals');

    globalThis.fetch = (async () => {
      throw new Error('network should not be called due cache');
    });

    const second = await resolveSectorSignals('gezondheidszorg');
    assert(second.source === 'cache', 'second fetch should use cache');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

(async () => {
  await testScoreRubric();
  await testCacheAndFetchMock();
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_first_navigation_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_missing_organization_recovery_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_youth_case_content_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_quality_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_scenario_distinctness_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_metadata_consistency_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_intervention_engine_smoke_test.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_analysis_map_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_strategic_failure_engine_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_strategic_pattern_engine_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_boardroom_red_flag_engine_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_prompt_stack_architecture_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_strategic_question_engine_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_mechanism_engine_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_multi_sector_golden_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_blindspot_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_decision_consequence_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_leverage_detector_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_memory_engine_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_memory_outcome_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_sector_recommendation_ranking_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_input_batch_scorecards_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_adversarial_input_batch_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_board_memo_quality_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_end_to_end_sector_fixture_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_boardroom_debate_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_selection_identity_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_seed_navigation_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_analysis_completion_resilience_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_intake_dom_fallback_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_boardroom_modules_input_scope_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_boardroom_modules_resilience_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_output_contract_guard_csp_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_render_quality_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_pdf_design_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_design_bible_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_stability_console_quiet_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_report_speed_mode_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_boardroom_language_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_killer_insight_ranking_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_analysis_report_flow_regression.mjs')], {
    stdio: 'inherit',
  });
  execFileSync(process.execPath, [path.resolve(process.cwd(), 'scripts/test/run_stability_regression.mjs')], {
    stdio: 'inherit',
  });
  console.log('unit smoke tests passed');
})();
