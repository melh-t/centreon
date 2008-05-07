# -*-Shell-script-*-
# Install script for Centreon Web Front

echo "------------------------------------------------------------------------"
echo -e "\t`gettext \"Start CentWeb Installation\"`"
echo "------------------------------------------------------------------------"


## Create install_dir_centreon
locate_centreon_installdir
[ ! -d $INSTALL_DIR_CENTREON/examples ] && mkdir -p $INSTALL_DIR_CENTREON/examples

## locate or create Centreon log dir
locate_centreon_logdir
locate_centreon_etcdir
locate_centreon_generationdir

## Config pre-require
locate_rrd_perldir
locate_rrdtool
locate_mail
locate_pear
locate_nagios_installdir
locate_nagios_etcdir
locate_nagios_vardir
locate_nagios_plugindir
locate_nagios_binary
locate_nagios_imgdir
locate_nagiosstats_binary
locate_nagios_plugindir
locate_cron_d
locate_init_d
locate_php_bin

## Config apache
check_httpd_directory
check_group_apache
check_user_apache
check_user_nagios
check_group_nagios

## Config Sudo
# I think this process move on CentCore install...
configureSUDO

## Config Apache
configureApache "$INSTALL_DIR_CENTREON/examples"

## Create temps folder and copy all src into
copyInTempFile 2>>$LOG_FILE 

## InstallCentreon

echo "------------------------------------------------------------------------"
echo -e "\t`gettext \"Start Centreon Web Front Installation\"`"
echo -e "------------------------------------------------------------------------\n\n"

# change right centreon_log directory
log "INFO" "`gettext \"Change right on\"` $CENTREON_LOG"
$INSTALL_DIR/cinstall -u $WEB_USER -g $NAGIOS_GROUP -d 775 -v \
	$CENTREON_LOG >> $LOG_FILE 2>&1

# change right on centreon etc
log "INFO" "`gettext \"Change right on\"` $CENTREON_ETC"
$INSTALL_DIR/cinstall -u $WEB_USER -d 755 -v \
	$CENTREON_ETC >> $LOG_FILE 2>&1

## Copy Web Front Source in final
log "INFO" "`gettext \"Copy CentWeb and GPL_LIB in temporary final dir\"`"
cp -Rf $TMPDIR/src/www $TMPDIR/final
cp -Rf $TMPDIR/src/GPL_LIB $TMPDIR/final

## Create temporary directory
mkdir -p $TMPDIR/work/www/install >> $LOG_FILE 2>&1
mkdir -p $TMPDIR/work/cron/reporting >> $LOG_FILE 2>&1
mkdir -p $TMPDIR/final/cron/reporting >> $LOG_FILE 2>&1

## Prepare insertBaseConf.sql
echo -e "`gettext \"In process\"`"
### Step 1:
## Change Macro on sql file
log "INFO" "`gettext \"Change macros for insertBaseConf.sql\"`"
sed -e 's|@NAGIOS_VAR@|'"$NAGIOS_VAR"'|g' \
	-e 's|@NAGIOS_BINARY@|'"$NAGIOS_BINARY"'|g' \
	-e 's|@NAGIOSSTATS_BINARY@|'"$NAGIOSSTATS_BINARY"'|g' \
	-e 's|@NAGIOS_IMG@|'"$NAGIOS_IMG"'|g' \
	-e 's|@INSTALL_DIR_NAGIOS@|'"$INSTALL_DIR_NAGIOS"'|g' \
	-e 's|@NAGIOS_USER@|'"$NAGIOS_USER"'|g' \
	-e 's|@NAGIOS_GROUP@|'"$NAGIOS_GROUP"'|g' \
	-e 's|@NAGIOS_ETC@|'"$NAGIOS_ETC"'|g' \
	-e 's|@NAGIOS_PLUGIN@|'"$NAGIOS_PLUGIN"'|g' \
	-e 's|@NAGIOS_BIN@|'"$NAGIOS_BIN"'|g' \
	-e 's|@NAGIOS_INIT_SCRIPT@|'"$NAGIOS_INIT_SCRIPT"'|g' \
	-e 's|@RRDTOOL_PERL_LIB@|'"$RRD_PERL"'|g' \
	-e 's|@INSTALL_DIR_CENTREON@|'"$INSTALL_DIR_CENTREON"'|g' \
	-e 's|@BIN_RRDTOOL@|'"$BIN_RRDTOOL"'|g' \
	-e 's|@BIN_MAIL@|'"$BIN_MAIL"'|g' \
	-e 's|@INIT_D@|'"$INIT_D"'|g' \
	-e 's|\/\/|\/|g' \
$TMPDIR/src/www/install/insertBaseConf.sql > $TMPDIR/work/www/install/insertBaseConf.sql

## Copy in final dir
log "INFO" "Copying www/install/insertBaseConf.sql in final directory"
cp $TMPDIR/work/www/install/insertBaseConf.sql $TMPDIR/final/www/install/insertBaseConf.sql >> $LOG_FILE 2>&1

### Step 2: Change right on Centreon WebFront

## use this step to change macros on php file...


### Step 3: Change right on nagios_etcdir
log "INFO" "`gettext \"Change right on\"` $NAGIOS_ETC" 
$INSTALL_DIR/cinstall -g $WEB_GROUP -d 775 -v \
	$NAGIOS_ETC >> $LOG_FILE 2>&1
find $NAGIOS_ETC -type f -print | \
	xargs -I '{}' chmod -v 775 '{}' >> $LOG_FILE 2>&1
find $NAGIOS_ETC -type f -print | \
	xargs -I '{}' chown -v $WEB_USER:$WEB_GROUP '{}' >> $LOG_FILE 2>&1

### Step 4: Copy final stuff in system directoy
log "INFO" "`gettext \"Copy CentWeb in system directory\"`"
echo_info "`gettext \"Copy CentWeb in system directory\"`"
$INSTALL_DIR/cinstall -u $WEB_USER -g $WEB_GROUP -d 755 -m 644 -v \
	$TMPDIR/final/www $INSTALL_DIR_CENTREON/www >> $LOG_FILE 2>&1

$INSTALL_DIR/cinstall -u $WEB_USER -g $WEB_GROUP -d 775 -v \
	$CENTREON_GENDIR/filesGeneration/nagiosCFG >> $LOG_FILE 2>&1
# link on INSTALL_DIR_CENTREON
[ ! -h $INSTALL_DIR_CENTREON/filesGeneration -a ! -d $INSTALL_DIR_CENTREON/filesGeneration ] && \
	ln -s $CENTREON_GENDIR/filesGeneration $INSTALL_DIR_CENTREON >> $LOG_FILE 2>&1

$INSTALL_DIR/cinstall -u $WEB_USER -g $WEB_GROUP -d 775 -v \
	$CENTREON_GENDIR/filesUpload/nagiosCFG >> $LOG_FILE 2>&1
# link on INSTALL_DIR_CENTREON
[ ! -h $INSTALL_DIR_CENTREON/filesUpload -a ! -d $INSTALL_DIR_CENTREON/filesUpload ] && \
	ln -s $CENTREON_GENDIR/filesUpload $INSTALL_DIR_CENTREON >> $LOG_FILE 2>&1

log "INFO" "`gettext \"Copying GPL_LIB\"`"
$INSTALL_DIR/cinstall -u $WEB_USER -g $WEB_GROUP -d 755 -m 644 -v \
	$TMPDIR/final/GPL_LIB $INSTALL_DIR_CENTREON/GPL_LIB >> $LOG_FILE 2>&1

echo_passed "`gettext \"CentWeb file installation\"`" "$ok"

## Cron stuff
log "INFO" "`gettext \"Change macros for centreon.cron\"`"
sed -e 's|@PHP_BIN@|'"$PHP_BIN"'|g' \
	-e 's|@INSTALL_DIR_CENTREON@|'"$INSTALL_DIR_CENTREON"'|g' \
	-e 's|@CENTREON_LOG@|'"$CENTREON_LOG"'|g' \
	$BASE_DIR/tmpl/install/centreon.cron > $TMPDIR/work/centreon.cron
cp $TMPDIR/work/centreon.cron $TMPDIR/final/centreon.cron >> $LOG_FILE 2>&1

log "INFO" "`gettext \"Install centreon.cron\"`"
$INSTALL_DIR/cinstall -m 644 -v \
	$TMPDIR/final/centreon.cron $CRON_D/centreon >> $LOG_FILE 2>&1
echo_success "`gettext \"Install Centreon cron\"`" "$ok"

## cron binary
cp -R $TMPDIR/src/cron/ $TMPDIR/final/
log "INFO" "`gettext \"Change macros for ArchiveLogInDB.php\"`"
sed -e 's|@CENTREON_ETC@|'"$CENTREON_ETC"'|g' \
	$TMPDIR/src/cron/reporting/ArchiveLogInDB.php > $TMPDIR/work/cron/reporting/ArchiveLogInDB.php

cp -f $TMPDIR/work/cron/reporting/ArchiveLogInDB.php $TMPDIR/final/cron/reporting/ArchiveLogInDB.php

log "INFO" "`gettext \"Change macros for centAcl.php\"`"
sed -e 's|@CENTREON_ETC@|'"$CENTREON_ETC"'|g' \
	$TMPDIR/src/cron/centAcl.php > $TMPDIR/work/cron/centAcl.php

cp -f $TMPDIR/work/cron/centAcl.php $TMPDIR/final/cron/centAcl.php

log "INFO" "`gettext \"Install cron directory\"`"
$INSTALL_DIR/cinstall -u $NAGIOS_USER -g $WEB_GROUP -d 755 -m 755 -v \
	$TMPDIR/final/cron $INSTALL_DIR_CENTREON/cron >> $LOG_FILE 2>&1


echo -e "`gettext \"Pear Modules\"`"
pear_module=0
while [ $pear_module -eq 0 ] ; do 
	check_pear_module $INSTALL_VARS_DIR/$PEAR_MODULES_LIST
	if [ $? -ne 0 ] ; then
		yes_no_default "`gettext \"Do you want I install/upgrade your PEAR modules\"`" "$yes"
		if [ $? -eq 0 ] ; then
			upgrade_pear_module $INSTALL_VARS_DIR/$PEAR_MODULES_LIST
			install_pear_module $INSTALL_VARS_DIR/$PEAR_MODULES_LIST
		else
			pear_module=1
		fi
	else 
		echo_success "`gettext \"All PEAR module\"`" "$ok"
		pear_module=1
	fi
done

## Create configfile for web install
createConfFile

## Write install config file
createCentreonInstallConf

## wait sql inject script....

