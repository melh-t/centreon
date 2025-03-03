<?php

/*
 * Copyright 2005-2021 Centreon
 * Centreon is developed by : Julien Mathis and Romain Le Merlus under
 * GPL Licence 2.0.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation ; either version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Linking this program statically or dynamically with other modules is making a
 * combined work based on this program. Thus, the terms and conditions of the GNU
 * General Public License cover the whole combination.
 *
 * As a special exception, the copyright holders of this program give Centreon
 * permission to link this program with independent modules to produce an executable,
 * regardless of the license terms of these independent modules, and to copy and
 * distribute the resulting executable under terms of Centreon choice, provided that
 * Centreon also meet, for each linked independent module, the terms  and conditions
 * of the license of that module. An independent module is a module which is not
 * derived from this program. If you modify this program, you may extend this
 * exception to your version of the program, but you are not obliged to do so. If you
 * do not wish to do so, delete this exception statement from your version.
 *
 * For more information : contact@centreon.com
 *
 */

if (!isset($centreon)) {
    exit;
}

/*
 * Required files
 */
require_once './include/reporting/dashboard/initReport.php';

/*
 *  Getting service to report
 */
$hostId = filter_var($_GET['host_id'] ?? $_POST['host_id'] ?? false, FILTER_VALIDATE_INT);
$serviceId = filter_var($_GET['item'] ?? $_POST['item'] ?? false, FILTER_VALIDATE_INT);

/*
 * FORMS
 */
$form = new HTML_QuickFormCustom('formItem', 'post', "?p=" . $p);

$host_name = getMyHostName($hostId);
$items = $centreon->user->access->getHostServices($pearDBO, $hostId);

$itemsForUrl = array();
foreach ($items as $key => $value) {
    $itemsForUrl[str_replace(":", "%3A", $key)] = str_replace(":", "%3A", $value);
}
$service_name = $itemsForUrl[$serviceId];

$select = $form->addElement(
    'select',
    'item',
    _("Service"),
    $items,
    array(
        "onChange" =>"this.form.submit();"
    )
);
$form->addElement(
    'hidden',
    'period',
    $period
);
$form->addElement(
    'hidden',
    'StartDate',
    $get_date_start
);
$form->addElement(
    'hidden',
    'EndDate',
    $get_date_end
);
$form->addElement('hidden', 'p', $p);
$redirect = $form->addElement('hidden', 'o');
$redirect->setValue($o);

/*
 * Set service id with period selection form
 */
if ($serviceId !== false && $hostId !== false) {
    $formPeriod->addElement(
        'hidden',
        'item',
        $serviceId
    );
    $formPeriod->addElement(
        'hidden',
        'host_id',
        $hostId
    );
    $form->addElement(
        'hidden',
        'host_id',
        $hostId
    );
    $form->setDefaults(array('item' => $serviceId));

    /*
     * Getting periods values
     */
    $dates = getPeriodToReport("alternate");
    $startDate = $dates[0];
    $endDate = $dates[1];

    /*
     * Getting hostgroup and his hosts stats
     */
    $servicesStats = getServicesLogs(
        [[
            'hostId' => $hostId,
            'serviceId' => $serviceId
        ]],
        $startDate,
        $endDate,
        $reportingTimePeriod
    );
    if (!empty($servicesStats)) {
        $serviceStats = $servicesStats[$hostId][$serviceId];
    } else {
        $serviceStats = [
            "OK_TF" => null,
            "OK_MP" => null,
            "OK_TP" => null,
            "OK_A" => null,
            "WARNING_TP" => null,
            "WARNING_A" => null,
            "WARNING_MP" => null,
            "WARNING_TF" => null,
            "CRITICAL_TP" => null,
            "CRITICAL_A" => null,
            "CRITICAL_MP" => null,
            "CRITICAL_TF" => null,
            "UNKNOWN_TP" => null,
            "UNKNOWN_A" => null,
            "UNKNOWN_MP" => null,
            "UNKNOWN_TF" => null,
            "UNDETERMINED_TP" => null,
            "UNDETERMINED_A" => null,
            "UNDETERMINED_TF" => null,
            "MAINTENANCE_TP" => null,
            "MAINTENANCE_TF" => null,
            "TOTAL_ALERTS" => null,
            "TOTAL_TIME_F" => null,
        ];
    }

    /*
     * Chart datas
     */
    $tpl->assign('service_ok', $serviceStats["OK_TP"]);
    $tpl->assign('service_warning', $serviceStats["WARNING_TP"]);
    $tpl->assign('service_critical', $serviceStats["CRITICAL_TP"]);
    $tpl->assign('service_unknown', $serviceStats["UNKNOWN_TP"]);
    $tpl->assign('service_undetermined', $serviceStats["UNDETERMINED_TP"]);
    $tpl->assign('service_maintenance', $serviceStats["MAINTENANCE_TP"]);

    /*
     * Exporting variables for ihtml
     */
    $tpl->assign('host_name', $host_name);
    $tpl->assign('name', $itemsForUrl[$serviceId]);
    $tpl->assign('totalAlert', $serviceStats["TOTAL_ALERTS"]);
    $tpl->assign('totalTime', $serviceStats["TOTAL_TIME_F"]);
    $tpl->assign('summary', $serviceStats);
    $tpl->assign('from', _("From"));
    $tpl->assign('date_start', $startDate);
    $tpl->assign('to', _("to"));
    $tpl->assign('date_end', $endDate);
    $formPeriod->setDefaults(['period' => $period]);
    $tpl->assign('id', $serviceId);

    /*
     * Ajax timeline and CSV export initialization
     * CSV Export
     */
    $tpl->assign(
        "link_csv_url",
        "./include/reporting/dashboard/csvExport/csv_ServiceLogs.php?host="
        . $hostId . "&service=" . $serviceId . "&start=" . $startDate . "&end=" . $endDate
    );
    $tpl->assign("link_csv_name", _("Export in CSV format"));

    /*
     * status colors
     */
    $color = substr($colors["up"], 1)
        . ':' . substr($colors["down"], 1)
        . ':' . substr($colors["unreachable"], 1)
        . ':' . substr($colors["undetermined"], 1)
        . ':' . substr($colors["maintenance"], 1);

    /*
     * Ajax timeline
     */
    $type = 'Service';
    include("./include/reporting/dashboard/ajaxReporting_js.php");
} else {
    ?><script type="text/javascript"> function initTimeline() {;} </script> <?php
}
$tpl->assign('resumeTitle', _("Service state"));
$tpl->assign('p', $p);

/*
 * Rendering forms
 */
$renderer = new HTML_QuickForm_Renderer_ArraySmarty($tpl);
$formPeriod->accept($renderer);
$tpl->assign('formPeriod', $renderer->toArray());

$renderer = new HTML_QuickForm_Renderer_ArraySmarty($tpl);
$form->accept($renderer);
$tpl->assign('formItem', $renderer->toArray());

if (
    !$formPeriod->isSubmitted()
    || ($formPeriod->isSubmitted() && $formPeriod->validate())
) {
    $tpl->display("template/viewServicesLog.ihtml");
}
